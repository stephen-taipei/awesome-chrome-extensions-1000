document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('map-canvas');
  const ctx = canvas.getContext('2d');
  const nodeCountEl = document.getElementById('node-count');
  const connectionCountEl = document.getElementById('connection-count');
  const snapshotCountEl = document.getElementById('snapshot-count');

  // Load and display data
  function loadData() {
    chrome.storage.local.get(['sessionNodes', 'connections', 'snapshots', 'autoMapping'], (data) => {
      const nodes = data.sessionNodes || [];
      const connections = data.connections || [];
      const snapshots = data.snapshots || [];

      nodeCountEl.textContent = nodes.length;
      connectionCountEl.textContent = connections.length;
      snapshotCountEl.textContent = snapshots.length;

      document.getElementById('auto-toggle').checked = data.autoMapping !== false;

      drawMiniMap(nodes, connections);
    });
  }

  function drawMiniMap(nodes, connections) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (nodes.length === 0) {
      ctx.fillStyle = '#666';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Start browsing to generate map', canvas.width / 2, canvas.height / 2);
      return;
    }

    // Calculate positions
    const positions = nodes.map((node, i) => ({
      x: 30 + (i % 5) * 50,
      y: 30 + Math.floor(i / 5) * 40,
      node
    }));

    // Draw connections
    ctx.strokeStyle = 'rgba(100, 255, 218, 0.3)';
    ctx.lineWidth = 1;
    connections.forEach(conn => {
      const from = positions.find(p => p.node.id === conn.from);
      const to = positions.find(p => p.node.id === conn.to);
      if (from && to) {
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
      }
    });

    // Draw nodes
    positions.forEach((pos, i) => {
      const hue = (i * 30) % 360;
      ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 8, 0, Math.PI * 2);
      ctx.fill();

      // Glow effect
      ctx.shadowColor = `hsl(${hue}, 70%, 60%)`;
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
    });
  }

  // Save snapshot
  document.getElementById('snapshot-btn').addEventListener('click', () => {
    const name = `Snapshot ${new Date().toLocaleTimeString()}`;
    chrome.runtime.sendMessage({ type: 'SAVE_SNAPSHOT', name }, (response) => {
      if (response && response.success) {
        loadData();
      }
    });
  });

  // Clear session
  document.getElementById('clear-btn').addEventListener('click', () => {
    chrome.storage.local.set({ sessionNodes: [], connections: [] }, () => {
      loadData();
    });
  });

  // Export map
  document.getElementById('export-btn').addEventListener('click', () => {
    chrome.storage.local.get(['sessionNodes', 'connections'], (data) => {
      const exportData = JSON.stringify(data, null, 2);
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      chrome.downloads.download({
        url: url,
        filename: 'mind-map-export.json'
      });
    });
  });

  // Auto mapping toggle
  document.getElementById('auto-toggle').addEventListener('change', (e) => {
    chrome.storage.local.set({ autoMapping: e.target.checked });
  });

  loadData();
});
