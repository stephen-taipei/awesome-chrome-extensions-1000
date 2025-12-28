// OAuth Reference - Popup Script
class OAuthRef {
  constructor() {
    this.flows = [
      {name:'Authorization Code',desc:'User authorizes app, app exchanges code for token. Most secure for server-side apps.',use:'Web apps with backend'},
      {name:'Authorization Code + PKCE',desc:'Same as above but with code verifier for public clients.',use:'Mobile apps, SPAs'},
      {name:'Client Credentials',desc:'App authenticates with client ID/secret directly. No user involved.',use:'Machine-to-machine'},
      {name:'Implicit (Deprecated)',desc:'Token returned directly in URL. Less secure, no refresh tokens.',use:'Legacy SPAs only'},
      {name:'Resource Owner Password',desc:'User provides username/password directly to app. Trust required.',use:'First-party apps only'},
      {name:'Device Code',desc:'For devices without browser. User authorizes on another device.',use:'Smart TVs, CLI tools'}
    ];
    this.render();
  }
  render() {
    document.getElementById('flows').innerHTML = this.flows.map(f => `<div class="flow-item"><div class="flow-name">${f.name}</div><div class="flow-desc">${f.desc}</div><div class="flow-use">Use: ${f.use}</div></div>`).join('');
  }
}
document.addEventListener('DOMContentLoaded', () => new OAuthRef());
