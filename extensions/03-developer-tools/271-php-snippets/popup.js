// PHP Snippets - Popup Script
class PHPSnippets {
  constructor() { this.snippets = [{name:'PHP Tag',code:'<?php\n\n?>'},{name:'Echo',code:'echo "Hello, World!";'},{name:'Variables',code:'$name = "John";\n$age = 25;\n$active = true;'},{name:'Array',code:'$arr = ["a", "b", "c"];\n$assoc = ["key" => "value"];'},{name:'Function',code:'function greet($name) {\n    return "Hello, " . $name;\n}'},{name:'Arrow Function',code:'$add = fn($a, $b) => $a + $b;'},{name:'Class',code:'class User {\n    private $name;\n    \n    public function __construct($name) {\n        $this->name = $name;\n    }\n    \n    public function greet() {\n        return "Hello, " . $this->name;\n    }\n}'},{name:'If-Else',code:'if ($x > 0) {\n    echo "positive";\n} elseif ($x < 0) {\n    echo "negative";\n} else {\n    echo "zero";\n}'},{name:'For Loop',code:'for ($i = 0; $i < 10; $i++) {\n    echo $i;\n}'},{name:'Foreach',code:'foreach ($items as $item) {\n    echo $item;\n}\n\nforeach ($arr as $key => $val) {\n    echo "$key: $val";\n}'},{name:'Try-Catch',code:'try {\n    // Code\n} catch (Exception $e) {\n    echo $e->getMessage();\n}'},{name:'PDO Connect',code:'$pdo = new PDO(\n    "mysql:host=localhost;dbname=test",\n    "user",\n    "password"\n);'},{name:'PDO Query',code:'$stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");\n$stmt->execute([$id]);\n$user = $stmt->fetch();'},{name:'JSON',code:'$json = json_encode($data);\n$arr = json_decode($json, true);'},{name:'File Read',code:'$content = file_get_contents("file.txt");'},{name:'File Write',code:'file_put_contents("file.txt", $content);'}]; this.initElements(); this.bindEvents(); this.render(); }
  initElements() { this.search = document.getElementById('search'); this.list = document.getElementById('snippetList'); }
  bindEvents() { this.search.addEventListener('input', () => this.render()); }
  render() { const q = this.search.value.toLowerCase(); const filtered = this.snippets.filter(s => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)); this.list.innerHTML = filtered.map(s => `<div class="snippet-item" data-copy="${auditCopyAttribute(s.code)}" role="button" tabindex="0"><div class="snippet-name">${s.name}</div><div class="snippet-code">${this.escapeHtml(s.code)}</div></div>`).join(''); }
  escapeHtml(s) {
    return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
}
document.addEventListener('DOMContentLoaded', () => new PHPSnippets());

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
