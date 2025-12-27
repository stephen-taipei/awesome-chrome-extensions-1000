// Page Highlighter - Content Script

(function() {
  'use strict';

  let currentColor = '#FFEB3B';
  let enabled = true;
  let highlightsLoaded = false;

  // Generate unique ID
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Get page URL key
  function getPageKey() {
    return window.location.origin + window.location.pathname;
  }

  // Get XPath for element
  function getXPath(element) {
    if (element.id) {
      return `//*[@id="${element.id}"]`;
    }

    const parts = [];
    while (element && element.nodeType === Node.ELEMENT_NODE) {
      let index = 1;
      let sibling = element.previousSibling;
      while (sibling) {
        if (sibling.nodeType === Node.ELEMENT_NODE &&
            sibling.nodeName === element.nodeName) {
          index++;
        }
        sibling = sibling.previousSibling;
      }
      const tagName = element.nodeName.toLowerCase();
      parts.unshift(`${tagName}[${index}]`);
      element = element.parentNode;
    }
    return '/' + parts.join('/');
  }

  // Get text offset within element
  function getTextOffset(node, offset, container) {
    let totalOffset = 0;
    const walker = document.createTreeWalker(
      container,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    let currentNode;
    while (currentNode = walker.nextNode()) {
      if (currentNode === node) {
        return totalOffset + offset;
      }
      totalOffset += currentNode.textContent.length;
    }
    return totalOffset;
  }

  // Find text node at offset
  function findNodeAtOffset(container, offset) {
    const walker = document.createTreeWalker(
      container,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    let currentOffset = 0;
    let node;
    while (node = walker.nextNode()) {
      const len = node.textContent.length;
      if (currentOffset + len >= offset) {
        return { node, offset: offset - currentOffset };
      }
      currentOffset += len;
    }
    return null;
  }

  // Apply highlight to range
  function applyHighlight(range, color, id) {
    const span = document.createElement('span');
    span.className = 'page-highlighter-mark';
    span.dataset.highlightId = id;
    span.style.backgroundColor = color;
    span.style.padding = '2px 0';
    span.style.borderRadius = '2px';

    try {
      range.surroundContents(span);
      return true;
    } catch (e) {
      // Handle complex selections spanning multiple elements
      const contents = range.extractContents();
      wrapTextNodes(contents, color, id);
      range.insertNode(contents);
      return true;
    }
  }

  // Wrap text nodes for complex selections
  function wrapTextNodes(node, color, id) {
    if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
      const span = document.createElement('span');
      span.className = 'page-highlighter-mark';
      span.dataset.highlightId = id;
      span.style.backgroundColor = color;
      span.style.padding = '2px 0';
      span.style.borderRadius = '2px';
      node.parentNode.insertBefore(span, node);
      span.appendChild(node);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      Array.from(node.childNodes).forEach(child => wrapTextNodes(child, color, id));
    }
  }

  // Remove highlight by ID
  function removeHighlightById(id) {
    const marks = document.querySelectorAll(`[data-highlight-id="${id}"]`);
    marks.forEach(mark => {
      const parent = mark.parentNode;
      while (mark.firstChild) {
        parent.insertBefore(mark.firstChild, mark);
      }
      parent.removeChild(mark);
      parent.normalize();
    });
  }

  // Clear all highlights
  function clearAllHighlights() {
    const marks = document.querySelectorAll('.page-highlighter-mark');
    marks.forEach(mark => {
      const parent = mark.parentNode;
      while (mark.firstChild) {
        parent.insertBefore(mark.firstChild, mark);
      }
      parent.removeChild(mark);
      parent.normalize();
    });
  }

  // Save highlight to storage
  async function saveHighlight(highlightData) {
    try {
      const result = await chrome.storage.local.get(['highlights']);
      const allHighlights = result.highlights || {};
      const pageKey = getPageKey();

      if (!allHighlights[pageKey]) {
        allHighlights[pageKey] = [];
      }

      allHighlights[pageKey].push(highlightData);

      await chrome.storage.local.set({ highlights: allHighlights });

      // Notify popup
      chrome.runtime.sendMessage({ type: 'highlightAdded' }).catch(() => {});
    } catch (error) {
      console.error('Failed to save highlight:', error);
    }
  }

  // Load and restore highlights
  async function loadHighlights() {
    if (highlightsLoaded) return;
    highlightsLoaded = true;

    try {
      const result = await chrome.storage.local.get(['highlights']);
      const allHighlights = result.highlights || {};
      const pageKey = getPageKey();
      const pageHighlights = allHighlights[pageKey] || [];

      pageHighlights.forEach(h => {
        restoreHighlight(h);
      });
    } catch (error) {
      console.error('Failed to load highlights:', error);
    }
  }

  // Restore a single highlight
  function restoreHighlight(data) {
    try {
      const container = document.evaluate(
        data.xpath,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      ).singleNodeValue;

      if (!container) return false;

      const startNode = findNodeAtOffset(container, data.startOffset);
      const endNode = findNodeAtOffset(container, data.endOffset);

      if (!startNode || !endNode) return false;

      const range = document.createRange();
      range.setStart(startNode.node, startNode.offset);
      range.setEnd(endNode.node, endNode.offset);

      applyHighlight(range, data.color, data.id);
      return true;
    } catch (error) {
      console.error('Failed to restore highlight:', error);
      return false;
    }
  }

  // Handle text selection
  function handleSelection() {
    if (!enabled) return;

    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const text = selection.toString().trim();
    if (!text || text.length < 2) return;

    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;
    const containerElement = container.nodeType === Node.TEXT_NODE
      ? container.parentElement
      : container;

    // Don't highlight inside already highlighted content
    if (containerElement.closest('.page-highlighter-mark')) return;

    const id = generateId();
    const xpath = getXPath(containerElement);
    const startOffset = getTextOffset(range.startContainer, range.startOffset, containerElement);
    const endOffset = getTextOffset(range.endContainer, range.endOffset, containerElement);

    const highlightData = {
      id,
      text,
      color: currentColor,
      xpath,
      startOffset,
      endOffset,
      timestamp: Date.now()
    };

    if (applyHighlight(range, currentColor, id)) {
      saveHighlight(highlightData);
      selection.removeAllRanges();
    }
  }

  // Load settings
  async function loadSettings() {
    try {
      const result = await chrome.storage.local.get(['highlighterSettings']);
      const settings = result.highlighterSettings || {};
      currentColor = settings.color || '#FFEB3B';
      enabled = settings.enabled !== false;
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  // Listen for messages
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'settingsUpdate') {
      currentColor = message.color;
      enabled = message.enabled;
    } else if (message.type === 'removeHighlight') {
      removeHighlightById(message.id);
    } else if (message.type === 'clearHighlights') {
      clearAllHighlights();
    }
  });

  // Initialize
  async function init() {
    await loadSettings();

    // Wait for page to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', loadHighlights);
    } else {
      loadHighlights();
    }

    // Listen for selection
    document.addEventListener('mouseup', () => {
      setTimeout(handleSelection, 10);
    });

    document.addEventListener('keyup', (e) => {
      if (e.key === 'Escape') {
        window.getSelection().removeAllRanges();
      }
    });
  }

  init();
})();
