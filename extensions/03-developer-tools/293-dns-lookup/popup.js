// DNS Records Ref - Popup Script
class DNSRecordsRef {
  constructor() {
    this.records = [
      {type:'A',desc:'IPv4 address record - Maps hostname to IPv4 address'},
      {type:'AAAA',desc:'IPv6 address record - Maps hostname to IPv6 address'},
      {type:'CNAME',desc:'Canonical name - Alias for another domain name'},
      {type:'MX',desc:'Mail exchange - Specifies mail server for domain'},
      {type:'TXT',desc:'Text record - Stores arbitrary text (SPF, DKIM, etc.)'},
      {type:'NS',desc:'Name server - Delegates zone to authoritative servers'},
      {type:'SOA',desc:'Start of authority - Contains zone administration info'},
      {type:'PTR',desc:'Pointer record - Reverse DNS lookup (IP to hostname)'},
      {type:'SRV',desc:'Service record - Defines location of servers for services'},
      {type:'CAA',desc:'Certification authority - Specifies allowed CAs for domain'},
      {type:'DKIM',desc:'DomainKeys - Email authentication via cryptographic signature'},
      {type:'SPF',desc:'Sender Policy Framework - Email sender authorization (via TXT)'},
      {type:'DMARC',desc:'Domain-based Message Authentication - Email policy (via TXT)'}
    ];
    this.initElements(); this.bindEvents(); this.render();
  }
  initElements() { this.search = document.getElementById('search'); this.list = document.getElementById('recordList'); }
  bindEvents() { this.search.addEventListener('input', () => this.render()); }
  render() {
    const q = this.search.value.toLowerCase();
    const filtered = this.records.filter(r => r.type.toLowerCase().includes(q) || r.desc.toLowerCase().includes(q));
    this.list.innerHTML = filtered.map(r => `<div class="record-item"><div class="record-type">${r.type}</div><div class="record-desc">${r.desc}</div></div>`).join('');
  }
}
document.addEventListener('DOMContentLoaded', () => new DNSRecordsRef());
