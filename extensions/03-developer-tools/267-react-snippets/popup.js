// React Snippets - Popup Script
class ReactSnippets {
  constructor() { this.snippets = [{name:'Functional Component',code:'function Component() {\n  return (\n    <div>\n      Hello World\n    </div>\n  );\n}\nexport default Component;'},{name:'Arrow Component',code:'const Component = () => {\n  return (\n    <div>\n      Hello World\n    </div>\n  );\n};\nexport default Component;'},{name:'useState',code:'const [value, setValue] = useState(initialValue);'},{name:'useEffect',code:'useEffect(() => {\n  // Side effect\n  return () => {\n    // Cleanup\n  };\n}, [dependencies]);'},{name:'useEffect Mount',code:'useEffect(() => {\n  // Runs once on mount\n}, []);'},{name:'useRef',code:'const ref = useRef(null);\n// <input ref={ref} />\n// ref.current.focus();'},{name:'useContext',code:'const ThemeContext = createContext();\n\n// Provider\n<ThemeContext.Provider value={theme}>\n  {children}\n</ThemeContext.Provider>\n\n// Consumer\nconst theme = useContext(ThemeContext);'},{name:'useMemo',code:'const memoized = useMemo(() => {\n  return expensiveCalc(a, b);\n}, [a, b]);'},{name:'useCallback',code:'const memoizedFn = useCallback(() => {\n  doSomething(a, b);\n}, [a, b]);'},{name:'Custom Hook',code:'function useCustomHook(param) {\n  const [state, setState] = useState(null);\n  \n  useEffect(() => {\n    // Logic here\n  }, [param]);\n  \n  return state;\n}'},{name:'Props Interface',code:'interface Props {\n  title: string;\n  count?: number;\n  onClick: () => void;\n}'},{name:'Event Handler',code:'const handleClick = (e: React.MouseEvent) => {\n  e.preventDefault();\n  // Handle click\n};'},{name:'Map List',code:'{items.map((item) => (\n  <li key={item.id}>\n    {item.name}\n  </li>\n))}'},{name:'Conditional Render',code:'{isVisible && <Component />}\n\n{condition ? <A /> : <B />}'},{name:'Form Submit',code:'const handleSubmit = (e) => {\n  e.preventDefault();\n  const formData = new FormData(e.target);\n  // Process form\n};'}]; this.initElements(); this.bindEvents(); this.render(); }
  initElements() { this.search = document.getElementById('search'); this.list = document.getElementById('snippetList'); }
  bindEvents() { this.search.addEventListener('input', () => this.render()); }
  render() { const q = this.search.value.toLowerCase(); const filtered = this.snippets.filter(s => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)); this.list.innerHTML = filtered.map(s => `<div class="snippet-item" data-copy="${auditCopyAttribute(s.code)}" role="button" tabindex="0"><div class="snippet-name">${s.name}</div><div class="snippet-code">${this.escapeHtml(s.code)}</div></div>`).join(''); }
  escapeHtml(s) {
    return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
}
document.addEventListener('DOMContentLoaded', () => new ReactSnippets());

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
