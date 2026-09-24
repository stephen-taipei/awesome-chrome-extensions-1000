// Python Snippets - Popup Script
class PythonSnippets {
  constructor() { this.snippets = [{name:'Print',code:'print("Hello, World!")'},{name:'Variables',code:'name = "John"\nage = 25\npi = 3.14'},{name:'Input',code:'name = input("Enter name: ")\nprint(f"Hello, {name}")'},{name:'If-Else',code:'if x > 0:\n    print("positive")\nelif x < 0:\n    print("negative")\nelse:\n    print("zero")'},{name:'For Loop',code:'for i in range(10):\n    print(i)'},{name:'For Each',code:'items = [1, 2, 3]\nfor item in items:\n    print(item)'},{name:'While Loop',code:'i = 0\nwhile i < 10:\n    print(i)\n    i += 1'},{name:'List',code:'my_list = [1, 2, 3]\nmy_list.append(4)\nprint(my_list[0])'},{name:'Dictionary',code:'my_dict = {"key": "value"}\nmy_dict["new"] = "item"\nprint(my_dict.get("key"))'},{name:'Function',code:'def greet(name):\n    return f"Hello, {name}"\n\nprint(greet("World"))'},{name:'Lambda',code:'square = lambda x: x ** 2\nprint(square(5))'},{name:'List Comprehension',code:'squares = [x**2 for x in range(10)]\nevens = [x for x in range(20) if x % 2 == 0]'},{name:'Try-Except',code:'try:\n    result = 10 / 0\nexcept ZeroDivisionError:\n    print("Cannot divide by zero")'},{name:'File Read',code:'with open("file.txt", "r") as f:\n    content = f.read()'},{name:'File Write',code:'with open("file.txt", "w") as f:\n    f.write("Hello")'},{name:'Class',code:'class Person:\n    def __init__(self, name):\n        self.name = name\n    \n    def greet(self):\n        return f"Hi, {self.name}"'},{name:'Import',code:'import os\nfrom datetime import datetime\nimport json as j'},{name:'Main',code:'if __name__ == "__main__":\n    main()'}]; this.initElements(); this.bindEvents(); this.render(); }
  initElements() { this.search = document.getElementById('search'); this.list = document.getElementById('snippetList'); }
  bindEvents() { this.search.addEventListener('input', () => this.render()); }
  render() { const q = this.search.value.toLowerCase(); const filtered = this.snippets.filter(s => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)); this.list.innerHTML = filtered.map(s => `<div class="snippet-item" data-copy="${auditCopyAttribute(s.code)}" role="button" tabindex="0"><div class="snippet-name">${s.name}</div><div class="snippet-code">${this.escapeHtml(s.code)}</div></div>`).join(''); }
  escapeHtml(s) {
    return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
}
document.addEventListener('DOMContentLoaded', () => new PythonSnippets());

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
