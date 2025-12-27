// Mind Map Note - Popup Script

class MindMap {
  constructor() {
    this.nodes = [];
    this.connections = [];
    this.selectedNode = null;
    this.connectingFrom = null;
    this.currentColor = '#4CAF50';
    this.currentTool = 'add';
    this.scale = 1;
    this.offset = { x: 0, y: 0 };
    this.isDragging = false;
    this.dragNode = null;
    this.dragStart = { x: 0, y: 0 };

    this.initElements();
    this.initCanvas();
    this.loadData();
    this.bindEvents();
  }

  initElements() {
    this.canvas = document.getElementById('mindMapCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.container = document.getElementById('canvasContainer');
    this.nodeEditor = document.getElementById('nodeEditor');
    this.nodeText = document.getElementById('nodeText');
    this.saveNodeBtn = document.getElementById('saveNodeBtn');
    this.mapInfo = document.getElementById('mapInfo');
    this.toast = document.getElementById('toast');

    this.addNodeBtn = document.getElementById('addNodeBtn');
    this.connectBtn = document.getElementById('connectBtn');
    this.deleteBtn = document.getElementById('deleteBtn');
    this.newMapBtn = document.getElementById('newMapBtn');
    this.exportBtn = document.getElementById('exportBtn');
    this.zoomInBtn = document.getElementById('zoomInBtn');
    this.zoomOutBtn = document.getElementById('zoomOutBtn');
    this.colorBtns = document.querySelectorAll('.color-btn');
    this.toolBtns = document.querySelectorAll('.tool-btn');
  }

  initCanvas() {
    const resize = () => {
      this.canvas.width = this.container.clientWidth;
      this.canvas.height = this.container.clientHeight;
      this.render();
    };
    resize();
    window.addEventListener('resize', resize);
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  async loadData() {
    try {
      const result = await chrome.storage.local.get(['mindMapData']);
      const data = result.mindMapData || { nodes: [], connections: [] };
      this.nodes = data.nodes;
      this.connections = data.connections;

      if (this.nodes.length === 0) {
        // Add central node
        this.nodes.push({
          id: this.generateId(),
          text: '中心主題',
          x: this.canvas.width / 2,
          y: this.canvas.height / 2,
          color: '#667eea',
          radius: 50
        });
      }

      this.render();
      this.updateInfo();
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  }

  async saveData() {
    try {
      await chrome.storage.local.set({
        mindMapData: {
          nodes: this.nodes,
          connections: this.connections
        }
      });
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.save();
    ctx.translate(this.offset.x, this.offset.y);
    ctx.scale(this.scale, this.scale);

    // Draw connections
    this.connections.forEach(conn => {
      const from = this.nodes.find(n => n.id === conn.from);
      const to = this.nodes.find(n => n.id === conn.to);
      if (from && to) {
        this.drawConnection(from, to);
      }
    });

    // Draw nodes
    this.nodes.forEach(node => {
      this.drawNode(node, node === this.selectedNode);
    });

    ctx.restore();
  }

  drawNode(node, selected) {
    const ctx = this.ctx;
    const radius = node.radius || 40;

    // Shadow
    ctx.shadowColor = 'rgba(0,0,0,0.1)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;

    // Node circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = node.color;
    ctx.fill();

    // Selection ring
    if (selected) {
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    ctx.shadowColor = 'transparent';

    // Text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Word wrap
    const words = node.text.split('');
    const maxWidth = radius * 1.6;
    let line = '';
    let lines = [];

    for (let word of words) {
      const testLine = line + word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = testLine;
      }
    }
    lines.push(line);

    const lineHeight = 14;
    const startY = node.y - (lines.length - 1) * lineHeight / 2;
    lines.forEach((l, i) => {
      ctx.fillText(l, node.x, startY + i * lineHeight);
    });
  }

  drawConnection(from, to) {
    const ctx = this.ctx;
    const fromRadius = from.radius || 40;
    const toRadius = to.radius || 40;

    // Calculate edge points
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    const startX = from.x + Math.cos(angle) * fromRadius;
    const startY = from.y + Math.sin(angle) * fromRadius;
    const endX = to.x - Math.cos(angle) * toRadius;
    const endY = to.y - Math.sin(angle) * toRadius;

    // Draw curved line
    ctx.beginPath();
    ctx.moveTo(startX, startY);

    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;
    const ctrlX = midX + (to.y - from.y) * 0.1;
    const ctrlY = midY - (to.x - from.x) * 0.1;

    ctx.quadraticCurveTo(ctrlX, ctrlY, endX, endY);

    ctx.strokeStyle = '#999';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Arrow
    const arrowAngle = Math.atan2(endY - ctrlY, endX - ctrlX);
    const arrowSize = 8;
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(
      endX - arrowSize * Math.cos(arrowAngle - Math.PI / 6),
      endY - arrowSize * Math.sin(arrowAngle - Math.PI / 6)
    );
    ctx.lineTo(
      endX - arrowSize * Math.cos(arrowAngle + Math.PI / 6),
      endY - arrowSize * Math.sin(arrowAngle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fillStyle = '#999';
    ctx.fill();
  }

  getNodeAt(x, y) {
    // Transform coordinates
    const tx = (x - this.offset.x) / this.scale;
    const ty = (y - this.offset.y) / this.scale;

    for (let i = this.nodes.length - 1; i >= 0; i--) {
      const node = this.nodes[i];
      const radius = node.radius || 40;
      const dist = Math.sqrt((tx - node.x) ** 2 + (ty - node.y) ** 2);
      if (dist <= radius) {
        return node;
      }
    }
    return null;
  }

  addNode(x, y, text = '') {
    const tx = (x - this.offset.x) / this.scale;
    const ty = (y - this.offset.y) / this.scale;

    const node = {
      id: this.generateId(),
      text: text || '新節點',
      x: tx,
      y: ty,
      color: this.currentColor,
      radius: 40
    };

    this.nodes.push(node);
    this.selectedNode = node;
    this.saveData();
    this.render();
    this.updateInfo();
    this.showEditor(node);
  }

  deleteNode(node) {
    this.nodes = this.nodes.filter(n => n.id !== node.id);
    this.connections = this.connections.filter(
      c => c.from !== node.id && c.to !== node.id
    );
    this.selectedNode = null;
    this.saveData();
    this.render();
    this.updateInfo();
  }

  addConnection(from, to) {
    if (from.id === to.id) return;

    const exists = this.connections.some(
      c => (c.from === from.id && c.to === to.id) ||
           (c.from === to.id && c.to === from.id)
    );

    if (!exists) {
      this.connections.push({ from: from.id, to: to.id });
      this.saveData();
      this.render();
      this.updateInfo();
    }
  }

  showEditor(node) {
    this.nodeText.value = node.text;
    this.nodeEditor.classList.remove('hidden');
    this.nodeText.focus();
    this.nodeText.select();
  }

  hideEditor() {
    this.nodeEditor.classList.add('hidden');
  }

  updateNodeText() {
    if (this.selectedNode && this.nodeText.value.trim()) {
      this.selectedNode.text = this.nodeText.value.trim();
      this.saveData();
      this.render();
    }
    this.hideEditor();
  }

  setTool(tool) {
    this.currentTool = tool;
    this.connectingFrom = null;

    this.toolBtns.forEach(btn => btn.classList.remove('active'));
    if (tool === 'add') this.addNodeBtn.classList.add('active');
    if (tool === 'connect') this.connectBtn.classList.add('active');
    if (tool === 'delete') this.deleteBtn.classList.add('active');

    this.canvas.style.cursor = tool === 'delete' ? 'not-allowed' : 'crosshair';
  }

  setColor(color) {
    this.currentColor = color;
    this.colorBtns.forEach(btn => {
      btn.classList.toggle('selected', btn.dataset.color === color);
    });

    if (this.selectedNode) {
      this.selectedNode.color = color;
      this.saveData();
      this.render();
    }
  }

  zoom(delta) {
    const newScale = Math.max(0.5, Math.min(2, this.scale + delta));
    this.scale = newScale;
    this.render();
  }

  newMap() {
    if (confirm('確定要清除目前的心智圖嗎？')) {
      this.nodes = [{
        id: this.generateId(),
        text: '中心主題',
        x: this.canvas.width / 2,
        y: this.canvas.height / 2,
        color: '#667eea',
        radius: 50
      }];
      this.connections = [];
      this.selectedNode = null;
      this.saveData();
      this.render();
      this.updateInfo();
    }
  }

  exportPNG() {
    // Create a temporary canvas with white background
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = this.canvas.width;
    tempCanvas.height = this.canvas.height;
    const tempCtx = tempCanvas.getContext('2d');

    tempCtx.fillStyle = 'white';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    tempCtx.drawImage(this.canvas, 0, 0);

    const link = document.createElement('a');
    link.download = `mindmap-${Date.now()}.png`;
    link.href = tempCanvas.toDataURL('image/png');
    link.click();

    this.showToast('已匯出 PNG', 'success');
  }

  updateInfo() {
    this.mapInfo.textContent = `節點: ${this.nodes.length} | 連線: ${this.connections.length}`;
  }

  showToast(message, type = '') {
    this.toast.textContent = message;
    this.toast.className = 'toast';
    if (type) this.toast.classList.add(type);

    setTimeout(() => this.toast.classList.add('hidden'), 2000);
  }

  bindEvents() {
    // Canvas events
    this.canvas.addEventListener('mousedown', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const node = this.getNodeAt(x, y);

      if (node) {
        if (this.currentTool === 'delete') {
          this.deleteNode(node);
        } else if (this.currentTool === 'connect') {
          if (this.connectingFrom) {
            this.addConnection(this.connectingFrom, node);
            this.connectingFrom = null;
          } else {
            this.connectingFrom = node;
          }
        } else {
          this.selectedNode = node;
          this.dragNode = node;
          this.dragStart = { x: e.clientX, y: e.clientY };
          this.isDragging = true;
        }
        this.render();
      } else if (this.currentTool === 'add') {
        this.addNode(x, y);
      }
    });

    this.canvas.addEventListener('mousemove', (e) => {
      if (this.isDragging && this.dragNode) {
        const dx = (e.clientX - this.dragStart.x) / this.scale;
        const dy = (e.clientY - this.dragStart.y) / this.scale;
        this.dragNode.x += dx;
        this.dragNode.y += dy;
        this.dragStart = { x: e.clientX, y: e.clientY };
        this.render();
      }
    });

    this.canvas.addEventListener('mouseup', () => {
      if (this.isDragging) {
        this.saveData();
      }
      this.isDragging = false;
      this.dragNode = null;
    });

    this.canvas.addEventListener('dblclick', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const node = this.getNodeAt(x, y);

      if (node) {
        this.selectedNode = node;
        this.showEditor(node);
      }
    });

    // Tool buttons
    this.addNodeBtn.addEventListener('click', () => this.setTool('add'));
    this.connectBtn.addEventListener('click', () => this.setTool('connect'));
    this.deleteBtn.addEventListener('click', () => this.setTool('delete'));

    // Color buttons
    this.colorBtns.forEach(btn => {
      btn.addEventListener('click', () => this.setColor(btn.dataset.color));
    });

    // Zoom
    this.zoomInBtn.addEventListener('click', () => this.zoom(0.1));
    this.zoomOutBtn.addEventListener('click', () => this.zoom(-0.1));

    // Actions
    this.newMapBtn.addEventListener('click', () => this.newMap());
    this.exportBtn.addEventListener('click', () => this.exportPNG());

    // Node editor
    this.saveNodeBtn.addEventListener('click', () => this.updateNodeText());
    this.nodeText.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.updateNodeText();
      } else if (e.key === 'Escape') {
        this.hideEditor();
      }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.target === this.nodeText) return;

      if (e.key === 'Delete' && this.selectedNode) {
        this.deleteNode(this.selectedNode);
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new MindMap();
});
