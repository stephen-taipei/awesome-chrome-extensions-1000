// REST API Reference - Popup Script
class RESTAPIRef {
  constructor() {
    this.practices = [
      {title:'Use Nouns for Resources',desc:'Resources should be nouns, not verbs',example:'/users, /posts, /comments'},
      {title:'HTTP Methods for Actions',desc:'Use proper HTTP methods for operations',example:'GET /users, POST /users, DELETE /users/1'},
      {title:'Plural Resource Names',desc:'Use plural names for collections',example:'/users not /user, /posts not /post'},
      {title:'Nested Resources',desc:'Show relationships through nesting',example:'/users/1/posts, /posts/1/comments'},
      {title:'Filtering & Pagination',desc:'Use query params for filtering',example:'/users?role=admin&page=1&limit=20'},
      {title:'Versioning',desc:'Version your API in the URL or headers',example:'/api/v1/users, Accept: application/vnd.api+json;version=1'},
      {title:'Proper Status Codes',desc:'Return appropriate HTTP status codes',example:'200 OK, 201 Created, 400 Bad Request, 404 Not Found'},
      {title:'HATEOAS',desc:'Include links to related resources',example:'{ "user": {...}, "_links": { "posts": "/users/1/posts" } }'}
    ];
    this.render();
  }
  render() {
    document.getElementById('practices').innerHTML = this.practices.map(p => `<div class="practice-item"><div class="practice-title">${p.title}</div><div class="practice-desc">${p.desc}</div><div class="practice-example">${p.example}</div></div>`).join('');
  }
}
document.addEventListener('DOMContentLoaded', () => new RESTAPIRef());
