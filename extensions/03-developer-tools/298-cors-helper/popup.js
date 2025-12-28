// CORS Reference - Popup Script
class CORSRef {
  constructor() {
    this.headers = [
      {name:'Access-Control-Allow-Origin',desc:'Specifies allowed origins',example:'*, https://example.com'},
      {name:'Access-Control-Allow-Methods',desc:'Allowed HTTP methods',example:'GET, POST, PUT, DELETE'},
      {name:'Access-Control-Allow-Headers',desc:'Allowed request headers',example:'Content-Type, Authorization'},
      {name:'Access-Control-Allow-Credentials',desc:'Allow cookies/auth headers',example:'true'},
      {name:'Access-Control-Expose-Headers',desc:'Headers visible to client',example:'X-Custom-Header'},
      {name:'Access-Control-Max-Age',desc:'Preflight cache duration (seconds)',example:'86400'},
      {name:'Origin',desc:'Request origin (sent by browser)',example:'https://client.com'},
      {name:'Access-Control-Request-Method',desc:'Method for preflight check',example:'PUT'},
      {name:'Access-Control-Request-Headers',desc:'Headers for preflight check',example:'X-Custom'}
    ];
    this.render();
  }
  render() {
    document.getElementById('headers').innerHTML = this.headers.map(h => `<div class="header-item" onclick="navigator.clipboard.writeText('${h.name}')"><div class="header-name">${h.name}</div><div class="header-desc">${h.desc}</div><div class="header-example">${h.example}</div></div>`).join('');
  }
}
document.addEventListener('DOMContentLoaded', () => new CORSRef());
