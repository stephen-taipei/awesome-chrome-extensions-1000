// Port Lookup - Popup Script
class PortLookup {
  constructor() {
    this.ports = [
      {port:20,service:'FTP Data',proto:'TCP'},{port:21,service:'FTP Control',proto:'TCP'},{port:22,service:'SSH',proto:'TCP'},
      {port:23,service:'Telnet',proto:'TCP'},{port:25,service:'SMTP',proto:'TCP'},{port:53,service:'DNS',proto:'TCP/UDP'},
      {port:67,service:'DHCP Server',proto:'UDP'},{port:68,service:'DHCP Client',proto:'UDP'},{port:80,service:'HTTP',proto:'TCP'},
      {port:110,service:'POP3',proto:'TCP'},{port:123,service:'NTP',proto:'UDP'},{port:143,service:'IMAP',proto:'TCP'},
      {port:161,service:'SNMP',proto:'UDP'},{port:194,service:'IRC',proto:'TCP'},{port:443,service:'HTTPS',proto:'TCP'},
      {port:465,service:'SMTPS',proto:'TCP'},{port:514,service:'Syslog',proto:'UDP'},{port:587,service:'SMTP Submission',proto:'TCP'},
      {port:993,service:'IMAPS',proto:'TCP'},{port:995,service:'POP3S',proto:'TCP'},{port:1433,service:'MS SQL',proto:'TCP'},
      {port:1521,service:'Oracle DB',proto:'TCP'},{port:3000,service:'Dev Server',proto:'TCP'},{port:3306,service:'MySQL',proto:'TCP'},
      {port:3389,service:'RDP',proto:'TCP'},{port:5432,service:'PostgreSQL',proto:'TCP'},{port:5672,service:'RabbitMQ',proto:'TCP'},
      {port:5900,service:'VNC',proto:'TCP'},{port:6379,service:'Redis',proto:'TCP'},{port:8080,service:'HTTP Alt',proto:'TCP'},
      {port:8443,service:'HTTPS Alt',proto:'TCP'},{port:9200,service:'Elasticsearch',proto:'TCP'},{port:27017,service:'MongoDB',proto:'TCP'}
    ];
    this.initElements(); this.bindEvents(); this.render();
  }
  initElements() { this.search = document.getElementById('search'); this.list = document.getElementById('portList'); }
  bindEvents() { this.search.addEventListener('input', () => this.render()); }
  render() {
    const q = this.search.value.toLowerCase();
    const filtered = this.ports.filter(p => p.port.toString().includes(q) || p.service.toLowerCase().includes(q));
    this.list.innerHTML = filtered.map(p => `<div class="port-item"><span class="port-num">${p.port}</span><span class="port-service">${p.service}</span><span class="port-proto">${p.proto}</span></div>`).join('');
  }
}
document.addEventListener('DOMContentLoaded', () => new PortLookup());
