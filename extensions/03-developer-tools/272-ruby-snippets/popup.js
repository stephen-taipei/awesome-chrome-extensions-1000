// Ruby Snippets - Popup Script
class RubySnippets {
  constructor() { this.snippets = [{name:'Hello World',code:'puts "Hello, World!"'},{name:'Variables',code:'name = "Ruby"\nage = 25\nactive = true'},{name:'String Interpolation',code:'puts "Hello, #{name}!"'},{name:'Array',code:'arr = [1, 2, 3]\narr.push(4)\narr.each { |x| puts x }'},{name:'Hash',code:'hash = { key: "value", name: "Ruby" }\nputs hash[:key]'},{name:'Method',code:'def greet(name)\n  "Hello, #{name}"\nend'},{name:'Class',code:'class User\n  attr_accessor :name\n  \n  def initialize(name)\n    @name = name\n  end\n  \n  def greet\n    "Hello, #{@name}"\n  end\nend'},{name:'If-Else',code:'if x > 0\n  puts "positive"\nelsif x < 0\n  puts "negative"\nelse\n  puts "zero"\nend'},{name:'Ternary',code:'result = x > 0 ? "yes" : "no"'},{name:'Unless',code:'puts "zero" unless x != 0'},{name:'Each',code:'[1, 2, 3].each do |n|\n  puts n\nend'},{name:'Map',code:'doubled = [1, 2, 3].map { |n| n * 2 }'},{name:'Select',code:'evens = [1, 2, 3, 4].select { |n| n.even? }'},{name:'Block',code:'def with_timing\n  start = Time.now\n  yield\n  puts Time.now - start\nend'},{name:'Begin-Rescue',code:'begin\n  # Code\nrescue StandardError => e\n  puts e.message\nend'},{name:'File Read',code:'content = File.read("file.txt")'},{name:'File Write',code:'File.write("file.txt", content)'}]; this.initElements(); this.bindEvents(); this.render(); }
  initElements() { this.search = document.getElementById('search'); this.list = document.getElementById('snippetList'); }
  bindEvents() { this.search.addEventListener('input', () => this.render()); }
  render() { const q = this.search.value.toLowerCase(); const filtered = this.snippets.filter(s => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)); this.list.innerHTML = filtered.map(s => `<div class="snippet-item" data-copy="${auditCopyAttribute(s.code)}" role="button" tabindex="0"><div class="snippet-name">${s.name}</div><div class="snippet-code">${this.escapeHtml(s.code)}</div></div>`).join(''); }
  escapeHtml(s) {
    return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
}
document.addEventListener('DOMContentLoaded', () => new RubySnippets());

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
