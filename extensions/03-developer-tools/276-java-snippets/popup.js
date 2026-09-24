// Java Snippets - Popup Script
class JavaSnippets {
  constructor() { this.snippets = [{name:'Hello World',code:'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}'},{name:'Variables',code:'String name = "Java";\nint age = 25;\nboolean active = true;\nfinal double PI = 3.14;'},{name:'Method',code:'public String greet(String name) {\n    return "Hello, " + name;\n}'},{name:'Class',code:'public class User {\n    private String name;\n    private int age;\n    \n    public User(String name, int age) {\n        this.name = name;\n        this.age = age;\n    }\n    \n    public String getName() {\n        return name;\n    }\n}'},{name:'Interface',code:'public interface Greetable {\n    String greet();\n}'},{name:'If-Else',code:'if (x > 0) {\n    System.out.println("positive");\n} else if (x < 0) {\n    System.out.println("negative");\n} else {\n    System.out.println("zero");\n}'},{name:'Switch',code:'switch (value) {\n    case "a":\n        System.out.println("A");\n        break;\n    case "b":\n        System.out.println("B");\n        break;\n    default:\n        System.out.println("Other");\n}'},{name:'For Loop',code:'for (int i = 0; i < 10; i++) {\n    System.out.println(i);\n}'},{name:'For Each',code:'for (String item : items) {\n    System.out.println(item);\n}'},{name:'ArrayList',code:'List<String> list = new ArrayList<>();\nlist.add("item");\nlist.get(0);'},{name:'HashMap',code:'Map<String, Integer> map = new HashMap<>();\nmap.put("key", 42);\nmap.get("key");'},{name:'Stream',code:'list.stream()\n    .filter(x -> x > 0)\n    .map(x -> x * 2)\n    .collect(Collectors.toList());'},{name:'Lambda',code:'Comparator<Integer> cmp = (a, b) -> a - b;'},{name:'Try-Catch',code:'try {\n    // Code\n} catch (Exception e) {\n    e.printStackTrace();\n} finally {\n    // Cleanup\n}'},{name:'Try Resources',code:'try (BufferedReader br = new BufferedReader(new FileReader(file))) {\n    String line = br.readLine();\n}'}]; this.initElements(); this.bindEvents(); this.render(); }
  initElements() { this.search = document.getElementById('search'); this.list = document.getElementById('snippetList'); }
  bindEvents() { this.search.addEventListener('input', () => this.render()); }
  render() { const q = this.search.value.toLowerCase(); const filtered = this.snippets.filter(s => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)); this.list.innerHTML = filtered.map(s => `<div class="snippet-item" data-copy="${auditCopyAttribute(s.code)}" role="button" tabindex="0"><div class="snippet-name">${s.name}</div><div class="snippet-code">${this.escapeHtml(s.code)}</div></div>`).join(''); }
  escapeHtml(s) {
    return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
}
document.addEventListener('DOMContentLoaded', () => new JavaSnippets());

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
