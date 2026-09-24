// GraphQL Reference - Popup Script
class GraphQLRef {
  constructor() {
    this.snippets = [
      {name:'Query',code:'query GetUser($id: ID!) {\n  user(id: $id) {\n    id\n    name\n    email\n  }\n}'},
      {name:'Mutation',code:'mutation CreateUser($input: UserInput!) {\n  createUser(input: $input) {\n    id\n    name\n  }\n}'},
      {name:'Subscription',code:'subscription OnMessage {\n  messageAdded {\n    id\n    content\n    author\n  }\n}'},
      {name:'Fragment',code:'fragment UserFields on User {\n  id\n  name\n  email\n}\n\nquery {\n  user { ...UserFields }\n}'},
      {name:'Type Definition',code:'type User {\n  id: ID!\n  name: String!\n  email: String\n  posts: [Post!]!\n}'},
      {name:'Input Type',code:'input UserInput {\n  name: String!\n  email: String!\n  password: String!\n}'},
      {name:'Enum',code:'enum Status {\n  ACTIVE\n  INACTIVE\n  PENDING\n}'},
      {name:'Interface',code:'interface Node {\n  id: ID!\n}\n\ntype User implements Node {\n  id: ID!\n  name: String!\n}'}
    ];
    this.render();
  }
  render() {
    document.getElementById('snippets').innerHTML = this.snippets.map(s => `<div class="snippet-item" data-copy="${auditCopyAttribute(s.code)}" role="button" tabindex="0"><div class="snippet-name">${s.name}</div><div class="snippet-code">${this.escapeHtml(s.code)}</div></div>`).join('');
  }
  escapeHtml(s) {
    return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
}
document.addEventListener('DOMContentLoaded', () => new GraphQLRef());

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
