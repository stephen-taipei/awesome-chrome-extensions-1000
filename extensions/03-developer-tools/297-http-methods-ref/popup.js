// HTTP Methods Ref - Popup Script
class HTTPMethodsRef {
  constructor() {
    this.methods = [
      {name:'GET',desc:'Retrieve resource data',safe:true,idempotent:true,body:false},
      {name:'POST',desc:'Create new resource or submit data',safe:false,idempotent:false,body:true},
      {name:'PUT',desc:'Replace entire resource',safe:false,idempotent:true,body:true},
      {name:'PATCH',desc:'Partial resource update',safe:false,idempotent:false,body:true},
      {name:'DELETE',desc:'Remove a resource',safe:false,idempotent:true,body:false},
      {name:'HEAD',desc:'Same as GET but no body',safe:true,idempotent:true,body:false},
      {name:'OPTIONS',desc:'Get allowed methods for resource',safe:true,idempotent:true,body:false},
      {name:'CONNECT',desc:'Establish tunnel through proxy',safe:false,idempotent:false,body:false},
      {name:'TRACE',desc:'Diagnostic loop-back test',safe:true,idempotent:true,body:false}
    ];
    this.render();
  }
  render() {
    document.getElementById('methods').innerHTML = this.methods.map(m => `
      <div class="method-item">
        <span class="method-name">${m.name}</span>
        <div><div class="method-desc">${m.desc}</div>
        <div class="method-props">
          ${m.safe ? '<span class="prop safe">Safe</span>' : ''}
          ${m.idempotent ? '<span class="prop idempotent">Idempotent</span>' : ''}
          ${m.body ? '<span class="prop body">Has Body</span>' : ''}
        </div></div>
      </div>
    `).join('');
  }
}
document.addEventListener('DOMContentLoaded', () => new HTTPMethodsRef());
