// Annotation Tool - Content Script

(function() {
  'use strict';

  if (window.annotationToolLoaded) return;
  window.annotationToolLoaded = true;

  let canvas = null;
  let ctx = null;
  let isActive = false;
  let isDrawing = false;
  let currentTool = 'pen';
  let currentColor = '#FF0000';
  let currentSize = 3;
  let strokes = [];
  let currentStroke = null;
  let startPoint = null;
  let textInput = null;

  // Create canvas overlay
  function createCanvas() {
    if (canvas) return;

    canvas = document.createElement('canvas');
    canvas.id = 'annotation-canvas';
    canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 999999;
      pointer-events: none;
      touch-action: none;
    `;
    document.body.appendChild(canvas);

    ctx = canvas.getContext('2d');
    resizeCanvas();

    window.addEventListener('resize', resizeCanvas);
  }

  function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    redraw();
  }

  function removeCanvas() {
    if (canvas) {
      canvas.remove();
      canvas = null;
      ctx = null;
    }
    if (textInput) {
      textInput.remove();
      textInput = null;
    }
  }

  function setActive(active) {
    isActive = active;
    if (canvas) {
      canvas.style.pointerEvents = active ? 'auto' : 'none';
      canvas.style.cursor = active ? getCursor() : 'default';
    }
  }

  function getCursor() {
    switch (currentTool) {
      case 'pen':
      case 'highlighter':
        return 'crosshair';
      case 'eraser':
        return 'cell';
      case 'text':
        return 'text';
      default:
        return 'crosshair';
    }
  }

  function updateSettings(settings) {
    if (settings.tool) currentTool = settings.tool;
    if (settings.color) currentColor = settings.color;
    if (settings.size) currentSize = settings.size;

    if (canvas && isActive) {
      canvas.style.cursor = getCursor();
    }
  }

  function startStroke(e) {
    if (!isActive) return;

    const point = getPoint(e);
    isDrawing = true;
    startPoint = point;

    if (currentTool === 'text') {
      createTextInput(point);
      return;
    }

    if (currentTool === 'eraser') {
      eraseAt(point);
      return;
    }

    currentStroke = {
      tool: currentTool,
      color: currentColor,
      size: currentSize,
      points: [point]
    };
  }

  function continueStroke(e) {
    if (!isDrawing || !currentStroke) return;

    const point = getPoint(e);

    if (currentTool === 'eraser') {
      eraseAt(point);
      return;
    }

    if (currentTool === 'pen' || currentTool === 'highlighter') {
      currentStroke.points.push(point);
      redraw();
      drawStroke(currentStroke);
    } else {
      redraw();
      drawShape(currentStroke.tool, startPoint, point, currentColor, currentSize);
    }
  }

  function endStroke(e) {
    if (!isDrawing) return;
    isDrawing = false;

    if (currentStroke && currentStroke.points.length > 0) {
      if (currentTool === 'arrow' || currentTool === 'rect') {
        const point = getPoint(e);
        currentStroke.endPoint = point;
      }
      strokes.push(currentStroke);
    }

    currentStroke = null;
    startPoint = null;
    redraw();
  }

  function getPoint(e) {
    const rect = canvas.getBoundingClientRect();
    if (e.touches) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  function redraw() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    strokes.forEach(stroke => {
      if (stroke.tool === 'arrow' || stroke.tool === 'rect') {
        drawShape(stroke.tool, stroke.points[0], stroke.endPoint, stroke.color, stroke.size);
      } else if (stroke.tool === 'text') {
        drawText(stroke);
      } else {
        drawStroke(stroke);
      }
    });
  }

  function drawStroke(stroke) {
    if (!stroke.points || stroke.points.length < 2) return;

    ctx.beginPath();
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

    for (let i = 1; i < stroke.points.length; i++) {
      ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
    }

    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (stroke.tool === 'highlighter') {
      ctx.globalAlpha = 0.4;
      ctx.lineWidth = stroke.size * 3;
    }

    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  function drawShape(tool, start, end, color, size) {
    if (!start || !end) return;

    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.lineCap = 'round';

    if (tool === 'arrow') {
      // Draw line
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();

      // Draw arrowhead
      const angle = Math.atan2(end.y - start.y, end.x - start.x);
      const headLen = 15;

      ctx.beginPath();
      ctx.moveTo(end.x, end.y);
      ctx.lineTo(
        end.x - headLen * Math.cos(angle - Math.PI / 6),
        end.y - headLen * Math.sin(angle - Math.PI / 6)
      );
      ctx.moveTo(end.x, end.y);
      ctx.lineTo(
        end.x - headLen * Math.cos(angle + Math.PI / 6),
        end.y - headLen * Math.sin(angle + Math.PI / 6)
      );
      ctx.stroke();
    } else if (tool === 'rect') {
      ctx.beginPath();
      ctx.rect(start.x, start.y, end.x - start.x, end.y - start.y);
      ctx.stroke();
    }
  }

  function drawText(stroke) {
    ctx.font = `${stroke.size * 5}px sans-serif`;
    ctx.fillStyle = stroke.color;
    ctx.fillText(stroke.text, stroke.points[0].x, stroke.points[0].y);
  }

  function createTextInput(point) {
    if (textInput) textInput.remove();

    textInput = document.createElement('input');
    textInput.type = 'text';
    textInput.placeholder = '輸入文字...';
    textInput.style.cssText = `
      position: fixed;
      left: ${point.x}px;
      top: ${point.y - 20}px;
      z-index: 1000000;
      padding: 4px 8px;
      border: 2px solid ${currentColor};
      border-radius: 4px;
      font-size: ${currentSize * 5}px;
      outline: none;
    `;

    document.body.appendChild(textInput);
    textInput.focus();

    textInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && textInput.value.trim()) {
        strokes.push({
          tool: 'text',
          color: currentColor,
          size: currentSize,
          points: [point],
          text: textInput.value.trim()
        });
        textInput.remove();
        textInput = null;
        redraw();
      } else if (e.key === 'Escape') {
        textInput.remove();
        textInput = null;
      }
    });

    textInput.addEventListener('blur', () => {
      if (textInput?.value.trim()) {
        strokes.push({
          tool: 'text',
          color: currentColor,
          size: currentSize,
          points: [point],
          text: textInput.value.trim()
        });
        redraw();
      }
      textInput?.remove();
      textInput = null;
    });
  }

  function eraseAt(point) {
    const eraseRadius = currentSize * 3;
    strokes = strokes.filter(stroke => {
      if (stroke.tool === 'text') {
        const dx = point.x - stroke.points[0].x;
        const dy = point.y - stroke.points[0].y;
        return Math.sqrt(dx * dx + dy * dy) > eraseRadius;
      }

      return !stroke.points.some(p => {
        const dx = point.x - p.x;
        const dy = point.y - p.y;
        return Math.sqrt(dx * dx + dy * dy) < eraseRadius;
      });
    });
    redraw();
  }

  function undo() {
    strokes.pop();
    redraw();
    return strokes.length;
  }

  function clear() {
    strokes = [];
    redraw();
  }

  async function save() {
    const pageKey = window.location.origin + window.location.pathname;

    try {
      const result = await chrome.storage.local.get(['annotations']);
      const annotations = result.annotations || {};
      annotations[pageKey] = strokes;

      await chrome.storage.local.set({ annotations });
      return true;
    } catch (error) {
      console.error('Failed to save annotations:', error);
      return false;
    }
  }

  async function load() {
    const pageKey = window.location.origin + window.location.pathname;

    try {
      const result = await chrome.storage.local.get(['annotations']);
      const annotations = result.annotations || {};
      strokes = annotations[pageKey] || [];
      redraw();
    } catch (error) {
      console.error('Failed to load annotations:', error);
    }
  }

  // Event listeners
  function addEventListeners() {
    if (!canvas) return;

    canvas.addEventListener('mousedown', startStroke);
    canvas.addEventListener('mousemove', continueStroke);
    canvas.addEventListener('mouseup', endStroke);
    canvas.addEventListener('mouseleave', endStroke);

    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      startStroke(e);
    });
    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      continueStroke(e);
    });
    canvas.addEventListener('touchend', endStroke);
  }

  // Message listener
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
      case 'start':
        createCanvas();
        addEventListeners();
        updateSettings(message);
        setActive(true);
        load();
        sendResponse({ success: true });
        break;

      case 'stop':
        setActive(false);
        sendResponse({ success: true });
        break;

      case 'updateSettings':
        updateSettings(message);
        sendResponse({ success: true });
        break;

      case 'undo':
        const count = undo();
        sendResponse({ count });
        break;

      case 'clear':
        clear();
        sendResponse({ success: true });
        break;

      case 'save':
        save().then(success => sendResponse({ success }));
        return true;

      case 'getState':
        sendResponse({ active: isActive, count: strokes.length });
        break;
    }
  });
})();
