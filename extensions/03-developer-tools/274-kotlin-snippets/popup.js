// Kotlin Snippets - Popup Script
class KotlinSnippets {
  constructor() { this.snippets = [{name:'Hello World',code:'fun main() {\n    println("Hello, World!")\n}'},{name:'Variables',code:'val name = "Kotlin"\nvar age = 25\nconst val PI = 3.14'},{name:'Function',code:'fun greet(name: String): String {\n    return "Hello, $name"\n}'},{name:'Expression Body',code:'fun add(a: Int, b: Int) = a + b'},{name:'Class',code:'class User(val name: String, var age: Int) {\n    fun greet(): String {\n        return "Hello, $name"\n    }\n}'},{name:'Data Class',code:'data class User(\n    val id: Int,\n    val name: String,\n    val email: String?\n)'},{name:'Nullable',code:'var name: String? = null\nname?.let { println(it) }\nval len = name?.length ?: 0'},{name:'When',code:'when (x) {\n    1 -> println("one")\n    2 -> println("two")\n    else -> println("other")\n}'},{name:'If Expression',code:'val max = if (a > b) a else b'},{name:'For Loop',code:'for (i in 0..9) {\n    println(i)\n}\n\nfor (item in list) {\n    println(item)\n}'},{name:'List',code:'val list = listOf(1, 2, 3)\nval mutableList = mutableListOf(1, 2, 3)\nmutableList.add(4)'},{name:'Map',code:'val map = mapOf("key" to "value")\nval mutableMap = mutableMapOf<String, Int>()\nmutableMap["key"] = 42'},{name:'Lambda',code:'val add = { a: Int, b: Int -> a + b }\nlist.map { it * 2 }'},{name:'Extension Function',code:'fun String.addExclamation(): String {\n    return this + "!"\n}'},{name:'Try-Catch',code:'try {\n    // Code\n} catch (e: Exception) {\n    println(e.message)\n}'},{name:'Coroutine',code:'suspend fun fetchData(): Data {\n    return withContext(Dispatchers.IO) {\n        // Async work\n    }\n}'}]; this.initElements(); this.bindEvents(); this.render(); }
  initElements() { this.search = document.getElementById('search'); this.list = document.getElementById('snippetList'); }
  bindEvents() { this.search.addEventListener('input', () => this.render()); }
  render() { const q = this.search.value.toLowerCase(); const filtered = this.snippets.filter(s => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)); this.list.innerHTML = filtered.map(s => `<div class="snippet-item" data-copy="${auditCopyAttribute(s.code)}" role="button" tabindex="0"><div class="snippet-name">${s.name}</div><div class="snippet-code">${this.escapeHtml(s.code)}</div></div>`).join(''); }
  escapeHtml(s) {
    return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
}
document.addEventListener('DOMContentLoaded', () => new KotlinSnippets());

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
