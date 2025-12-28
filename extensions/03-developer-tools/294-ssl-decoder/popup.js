// SSL/TLS Reference - Popup Script
class SSLTLSRef {
  constructor() {
    this.protocols = [
      {name:'SSL 2.0',status:'deprecated'},{name:'SSL 3.0',status:'deprecated'},
      {name:'TLS 1.0',status:'deprecated'},{name:'TLS 1.1',status:'deprecated'},
      {name:'TLS 1.2',status:'secure'},{name:'TLS 1.3',status:'secure'}
    ];
    this.ciphers = [
      {name:'AES-256-GCM',status:'secure'},{name:'AES-128-GCM',status:'secure'},
      {name:'CHACHA20-POLY1305',status:'secure'},{name:'AES-256-CBC',status:'weak'},
      {name:'AES-128-CBC',status:'weak'},{name:'3DES',status:'deprecated'},
      {name:'RC4',status:'deprecated'},{name:'DES',status:'deprecated'}
    ];
    this.render();
  }
  render() {
    document.getElementById('protocols').innerHTML = this.protocols.map(p => `<div class="item"><span class="item-name">${p.name}</span><span class="item-status ${p.status}">${p.status}</span></div>`).join('');
    document.getElementById('ciphers').innerHTML = this.ciphers.map(c => `<div class="item"><span class="item-name">${c.name}</span><span class="item-status ${c.status}">${c.status}</span></div>`).join('');
  }
}
document.addEventListener('DOMContentLoaded', () => new SSLTLSRef());
