// PROTOTYPE_ONLY: this package is a UI concept, not an implemented tool.
// Do not report a successful operation or read/render legacy untrusted storage.
document.addEventListener('DOMContentLoaded', () => {
  document.body.dataset.implementation = 'prototype';
  const content = document.getElementById('content');
  const button = document.getElementById('action-btn');
  if (content) {
    const heading = document.createElement('strong');
    heading.textContent = 'Prototype — functionality not implemented';
    const explanation = document.createElement('p');
    explanation.textContent = 'This page demonstrates an interface only. It does not process, verify, fetch, or save your data. See docs/AUDIT-2026-09-24.md in the repository for implementation status.';
    content.replaceChildren(heading, explanation);
    content.setAttribute('role', 'note');
  }
  if (button) {
    button.disabled = true;
    button.textContent = 'Not implemented';
    button.title = 'This is a UI prototype, not a working extension.';
  }
});
