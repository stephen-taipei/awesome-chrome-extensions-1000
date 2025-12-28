// HTTP Status Ref - Popup Script
class HTTPStatusRef {
  constructor() {
    this.statuses = [
      {code:100,msg:'Continue'},{code:101,msg:'Switching Protocols'},{code:200,msg:'OK'},{code:201,msg:'Created'},
      {code:204,msg:'No Content'},{code:206,msg:'Partial Content'},{code:301,msg:'Moved Permanently'},
      {code:302,msg:'Found'},{code:304,msg:'Not Modified'},{code:307,msg:'Temporary Redirect'},
      {code:308,msg:'Permanent Redirect'},{code:400,msg:'Bad Request'},{code:401,msg:'Unauthorized'},
      {code:403,msg:'Forbidden'},{code:404,msg:'Not Found'},{code:405,msg:'Method Not Allowed'},
      {code:408,msg:'Request Timeout'},{code:409,msg:'Conflict'},{code:410,msg:'Gone'},
      {code:415,msg:'Unsupported Media Type'},{code:422,msg:'Unprocessable Entity'},{code:429,msg:'Too Many Requests'},
      {code:500,msg:'Internal Server Error'},{code:501,msg:'Not Implemented'},{code:502,msg:'Bad Gateway'},
      {code:503,msg:'Service Unavailable'},{code:504,msg:'Gateway Timeout'}
    ];
    this.initElements(); this.bindEvents(); this.render();
  }
  initElements() { this.search = document.getElementById('search'); this.list = document.getElementById('statusList'); }
  bindEvents() { this.search.addEventListener('input', () => this.render()); }
  render() {
    const q = this.search.value.toLowerCase();
    const filtered = this.statuses.filter(s => s.code.toString().includes(q) || s.msg.toLowerCase().includes(q));
    this.list.innerHTML = filtered.map(s => `<div class="status-item"><span class="status-code s${Math.floor(s.code/100)}">${s.code}</span><span class="status-msg">${s.msg}</span></div>`).join('');
  }
}
document.addEventListener('DOMContentLoaded', () => new HTTPStatusRef());
