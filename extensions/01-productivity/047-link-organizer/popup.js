// Link Organizer - Popup Script

class LinkOrganizer {
  constructor() {
    this.folders = [];
    this.editingFolderId = null;
    this.editingLinkId = null;
    this.selectedEmoji = '📁';
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.folderList = document.getElementById('folderList');
    this.emptyState = document.getElementById('emptyState');
    this.searchInput = document.getElementById('searchInput');

    // Folder Modal
    this.addFolderBtn = document.getElementById('addFolderBtn');
    this.folderModal = document.getElementById('folderModal');
    this.folderModalTitle = document.getElementById('folderModalTitle');
    this.folderName = document.getElementById('folderName');
    this.folderEmojiPicker = document.getElementById('folderEmojiPicker');
    this.saveFolderBtn = document.getElementById('saveFolderBtn');
    this.deleteFolderBtn = document.getElementById('deleteFolderBtn');

    // Link Modal
    this.addLinkBtn = document.getElementById('addLinkBtn');
    this.linkModal = document.getElementById('linkModal');
    this.linkModalTitle = document.getElementById('linkModalTitle');
    this.linkName = document.getElementById('linkName');
    this.linkUrl = document.getElementById('linkUrl');
    this.linkFolder = document.getElementById('linkFolder');
    this.saveLinkBtn = document.getElementById('saveLinkBtn');
    this.deleteLinkBtn = document.getElementById('deleteLinkBtn');
  }

  bindEvents() {
    // Search
    this.searchInput.addEventListener('input', () => this.renderFolders());

    // Folder modal
    this.addFolderBtn.addEventListener('click', () => this.openFolderModal());
    this.saveFolderBtn.addEventListener('click', () => this.saveFolder());
    this.deleteFolderBtn.addEventListener('click', () => this.deleteFolder());
    this.folderName.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.saveFolder();
    });

    // Link modal
    this.addLinkBtn.addEventListener('click', () => this.openLinkModal());
    this.saveLinkBtn.addEventListener('click', () => this.saveLink());
    this.deleteLinkBtn.addEventListener('click', () => this.deleteLink());
    this.linkName.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.saveLink();
    });

    // Close buttons
    document.querySelectorAll('.close-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const modalId = btn.dataset.close;
        document.getElementById(modalId).classList.add('hidden');
      });
    });

    // Modal backdrop clicks
    [this.folderModal, this.linkModal].forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('hidden');
      });
    });

    // Emoji picker
    this.folderEmojiPicker.querySelectorAll('.emoji-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.folderEmojiPicker.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.selectedEmoji = btn.dataset.emoji;
      });
    });
  }

  async loadData() {
    const result = await chrome.storage.local.get(['linkOrganizerData']);
    this.folders = result.linkOrganizerData || [];
    this.renderFolders();
  }

  async saveData() {
    await chrome.storage.local.set({ linkOrganizerData: this.folders });
  }

  openFolderModal(folder = null) {
    this.editingFolderId = folder?.id || null;
    this.folderModalTitle.textContent = folder ? '編輯資料夾' : '新增資料夾';
    this.deleteFolderBtn.classList.toggle('hidden', !folder);

    this.folderName.value = folder?.name || '';
    this.selectedEmoji = folder?.emoji || '📁';

    this.folderEmojiPicker.querySelectorAll('.emoji-btn').forEach(btn => {
      btn.classList.toggle('selected', btn.dataset.emoji === this.selectedEmoji);
    });

    this.folderModal.classList.remove('hidden');
    this.folderName.focus();
  }

  async saveFolder() {
    const name = this.folderName.value.trim();
    if (!name) return;

    if (this.editingFolderId) {
      const folder = this.folders.find(f => f.id === this.editingFolderId);
      if (folder) {
        folder.name = name;
        folder.emoji = this.selectedEmoji;
      }
    } else {
      this.folders.push({
        id: Date.now().toString(),
        name,
        emoji: this.selectedEmoji,
        links: []
      });
    }

    await this.saveData();
    this.renderFolders();
    this.folderModal.classList.add('hidden');
  }

  async deleteFolder() {
    if (!this.editingFolderId) return;

    this.folders = this.folders.filter(f => f.id !== this.editingFolderId);
    await this.saveData();
    this.renderFolders();
    this.folderModal.classList.add('hidden');
  }

  async openLinkModal(folderId = null, link = null) {
    this.editingLinkId = link?.id || null;
    this.editingLinkFolderId = folderId;
    this.linkModalTitle.textContent = link ? '編輯連結' : '新增連結';
    this.deleteLinkBtn.classList.toggle('hidden', !link);

    // Populate folder select
    this.linkFolder.innerHTML = '';
    this.folders.forEach(folder => {
      const option = document.createElement('option');
      option.value = folder.id;
      option.textContent = `${folder.emoji} ${folder.name}`;
      this.linkFolder.appendChild(option);
    });

    if (link) {
      this.linkName.value = link.name;
      this.linkUrl.value = link.url;
      this.linkFolder.value = folderId;
    } else {
      // Try to get current tab info
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        this.linkName.value = tab.title || '';
        this.linkUrl.value = tab.url || '';
      } catch {
        this.linkName.value = '';
        this.linkUrl.value = '';
      }
      if (folderId) {
        this.linkFolder.value = folderId;
      }
    }

    this.linkModal.classList.remove('hidden');
    this.linkName.focus();
  }

  async saveLink() {
    const name = this.linkName.value.trim();
    const url = this.linkUrl.value.trim();
    const folderId = this.linkFolder.value;

    if (!name || !url || !folderId) return;

    const folder = this.folders.find(f => f.id === folderId);
    if (!folder) return;

    if (this.editingLinkId) {
      // Remove from old folder
      if (this.editingLinkFolderId !== folderId) {
        const oldFolder = this.folders.find(f => f.id === this.editingLinkFolderId);
        if (oldFolder) {
          oldFolder.links = oldFolder.links.filter(l => l.id !== this.editingLinkId);
        }
      }

      // Update or add to new folder
      const existingLink = folder.links.find(l => l.id === this.editingLinkId);
      if (existingLink) {
        existingLink.name = name;
        existingLink.url = url;
        existingLink.favicon = this.getFaviconUrl(url);
      } else {
        folder.links.push({
          id: this.editingLinkId,
          name,
          url,
          favicon: this.getFaviconUrl(url)
        });
      }
    } else {
      folder.links.push({
        id: Date.now().toString(),
        name,
        url,
        favicon: this.getFaviconUrl(url)
      });
    }

    await this.saveData();
    this.renderFolders();
    this.linkModal.classList.add('hidden');
  }

  async deleteLink() {
    if (!this.editingLinkId || !this.editingLinkFolderId) return;

    const folder = this.folders.find(f => f.id === this.editingLinkFolderId);
    if (folder) {
      folder.links = folder.links.filter(l => l.id !== this.editingLinkId);
    }

    await this.saveData();
    this.renderFolders();
    this.linkModal.classList.add('hidden');
  }

  getFaviconUrl(url) {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return '';
    }
  }

  openLink(url) {
    chrome.tabs.create({ url });
  }

  renderFolders() {
    this.folderList.innerHTML = '';
    const searchTerm = this.searchInput.value.toLowerCase().trim();

    let hasResults = false;

    this.folders.forEach(folder => {
      // Filter links by search term
      let links = folder.links;
      if (searchTerm) {
        links = folder.links.filter(link =>
          link.name.toLowerCase().includes(searchTerm) ||
          link.url.toLowerCase().includes(searchTerm)
        );
        if (links.length === 0 && !folder.name.toLowerCase().includes(searchTerm)) {
          return;
        }
      }

      hasResults = true;

      const folderEl = document.createElement('div');
      folderEl.className = 'folder-item';
      folderEl.dataset.id = folder.id;

      folderEl.innerHTML = `
        <div class="folder-header">
          <span class="folder-icon">${folder.emoji}</span>
          <span class="folder-name">${this.escapeHtml(folder.name)}</span>
          <span class="folder-count">${folder.links.length}</span>
          <button class="folder-edit" data-id="${folder.id}">✎</button>
          <span class="folder-toggle">›</span>
        </div>
        <div class="folder-links">
          ${links.length > 0 ? links.map(link => `
            <div class="link-item" data-url="${this.escapeHtml(link.url)}">
              <div class="link-favicon">
                ${link.favicon ? `<img src="${link.favicon}" onerror="this.parentElement.textContent='🔗'">` : '🔗'}
              </div>
              <span class="link-name">${this.escapeHtml(link.name)}</span>
              <button class="link-edit" data-folder="${folder.id}" data-id="${link.id}">✎</button>
            </div>
          `).join('') : '<div class="no-links">沒有連結</div>'}
        </div>
      `;

      // Toggle folder
      const header = folderEl.querySelector('.folder-header');
      header.addEventListener('click', (e) => {
        if (!e.target.closest('.folder-edit')) {
          folderEl.classList.toggle('expanded');
        }
      });

      // Edit folder
      const editBtn = folderEl.querySelector('.folder-edit');
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openFolderModal(folder);
      });

      // Link clicks and edits
      folderEl.querySelectorAll('.link-item').forEach(linkEl => {
        linkEl.addEventListener('click', (e) => {
          if (!e.target.closest('.link-edit')) {
            this.openLink(linkEl.dataset.url);
          }
        });
      });

      folderEl.querySelectorAll('.link-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const link = folder.links.find(l => l.id === btn.dataset.id);
          this.openLinkModal(folder.id, link);
        });
      });

      // Expand if searching
      if (searchTerm) {
        folderEl.classList.add('expanded');
      }

      this.folderList.appendChild(folderEl);
    });

    this.emptyState.classList.toggle('hidden', hasResults || this.folders.length > 0);
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  new LinkOrganizer();
});
