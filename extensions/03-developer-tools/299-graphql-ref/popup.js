// GraphQL Reference - Popup Script
class GraphQLRef {
  constructor() {
    this.snippets = [
      {name:'Query',code:'query GetUser($id: ID!) {\n  user(id: $id) {\n    id\n    name\n    email\n  }\n}'},
      {name:'Mutation',code:'mutation CreateUser($input: UserInput!) {\n  createUser(input: $input) {\n    id\n    name\n  }\n}'},
      {name:'Subscription',code:'subscription OnMessage {\n  messageAdded {\n    id\n    content\n    author\n  }\n}'},
      {name:'Fragment',code:'fragment UserFields on User {\n  id\n  name\n  email\n}\n\nquery {\n  user { ...UserFields }\n}'},
      {name:'Type Definition',code:'type User {\n  id: ID!\n  name: String!\n  email: String\n  posts: [Post!]!\n}'},
      {name:'Input Type',code:'input UserInput {\n  name: String!\n  email: String!\n  password: String!\n}'},
      {name:'Enum',code:'enum Status {\n  ACTIVE\n  INACTIVE\n  PENDING\n}'},
      {name:'Interface',code:'interface Node {\n  id: ID!\n}\n\ntype User implements Node {\n  id: ID!\n  name: String!\n}'}
    ];
    this.render();
  }
  render() {
    document.getElementById('snippets').innerHTML = this.snippets.map(s => `<div class="snippet-item" onclick="navigator.clipboard.writeText(\`${s.code.replace(/`/g,'\\`')}\`)"><div class="snippet-name">${s.name}</div><div class="snippet-code">${this.escapeHtml(s.code)}</div></div>`).join('');
  }
  escapeHtml(s) { return s.replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
}
document.addEventListener('DOMContentLoaded', () => new GraphQLRef());
