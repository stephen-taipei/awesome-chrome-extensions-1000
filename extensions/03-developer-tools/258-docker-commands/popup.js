// Docker Commands - Popup Script
class DockerCommands {
  constructor() { this.commands = [{cmd:'docker build -t <name> .',desc:'Build image from Dockerfile'},{cmd:'docker run <image>',desc:'Run container from image'},{cmd:'docker run -d <image>',desc:'Run in detached mode'},{cmd:'docker run -p 8080:80 <img>',desc:'Map port 8080 to 80'},{cmd:'docker run -v /host:/cont <img>',desc:'Mount volume'},{cmd:'docker ps',desc:'List running containers'},{cmd:'docker ps -a',desc:'List all containers'},{cmd:'docker images',desc:'List images'},{cmd:'docker stop <container>',desc:'Stop container'},{cmd:'docker start <container>',desc:'Start container'},{cmd:'docker restart <container>',desc:'Restart container'},{cmd:'docker rm <container>',desc:'Remove container'},{cmd:'docker rmi <image>',desc:'Remove image'},{cmd:'docker exec -it <cont> bash',desc:'Shell into container'},{cmd:'docker logs <container>',desc:'View container logs'},{cmd:'docker logs -f <container>',desc:'Follow logs'},{cmd:'docker pull <image>',desc:'Pull image from registry'},{cmd:'docker push <image>',desc:'Push to registry'},{cmd:'docker-compose up',desc:'Start compose services'},{cmd:'docker-compose up -d',desc:'Start in background'},{cmd:'docker-compose down',desc:'Stop and remove'},{cmd:'docker system prune',desc:'Clean up unused resources'}]; this.initElements(); this.bindEvents(); this.render(); }
  initElements() { this.search = document.getElementById('search'); this.list = document.getElementById('cmdList'); }
  bindEvents() { this.search.addEventListener('input', () => this.render()); }
  render() { const q = this.search.value.toLowerCase(); const filtered = this.commands.filter(c => c.cmd.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q)); this.list.innerHTML = filtered.map(c => `<div class="cmd-item" data-copy="${auditCopyAttribute(c.cmd)}" role="button" tabindex="0"><div class="cmd-name">${this.escapeHtml(c.cmd)}</div><div class="cmd-desc">${c.desc}</div></div>`).join(''); }
  escapeHtml(s) {
    return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
}
document.addEventListener('DOMContentLoaded', () => new DockerCommands());

// MV3-safe copy controls: data is never interpolated into executable handlers.
function auditCopyAttribute(value) {
  return String(value ?? '').replace(/[&<>"'\r\n]/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    '\r': '&#13;', '\n': '&#10;'
  })[char]);
}
async function auditCopyControl(target) {
  const control = target instanceof Element ? target.closest('[data-copy]') : null;
  if (!control) return;
  let status = document.getElementById('audit-copy-status');
  if (!status) {
    status = document.createElement('p');
    status.id = 'audit-copy-status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    document.body.appendChild(status);
  }
  try {
    await navigator.clipboard.writeText(control.dataset.copy);
    status.textContent = 'Copied to clipboard.';
  } catch {
    status.textContent = 'Clipboard access was denied. Select and copy the text manually.';
  }
}
document.addEventListener('click', event => { void auditCopyControl(event.target); });
document.addEventListener('keydown', event => {
  const control = event.target instanceof Element ? event.target.closest('[data-copy]') : null;
  if (control && control.tagName !== 'BUTTON' && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault();
    void auditCopyControl(control);
  }
});
