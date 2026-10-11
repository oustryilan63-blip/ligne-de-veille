class Element{
  constructor(tag,doc){this.tag=tag.toLowerCase();this.tagName=tag.toUpperCase();this.doc=doc;this.children=[];this.dataset={};this.attrs={};this.events={};this.style={};this.value='';this.hidden=false;this.disabled=false;this._text='';this._classes=new Set();this.classList={add:(...cs)=>cs.forEach(c=>this._classes.add(c)),remove:(...cs)=>cs.forEach(c=>this._classes.delete(c)),contains:c=>this._classes.has(c),toggle:(c,on)=>{const add=on===undefined?!this._classes.has(c):on;add?this._classes.add(c):this._classes.delete(c);return add}};}
  set className(s){this._classes=new Set(s.split(/\s+/).filter(Boolean))}get className(){return [...this._classes].join(' ')}
  set id(s){this._id=s;this.doc.nodes[s]=this}get id(){return this._id||''}
  set textContent(s){this._text=String(s);this.children=[]}get textContent(){return this._text+this.children.map(c=>typeof c==='string'?c:c.textContent).join('')}
  get firstChild(){return this.children[0]}get parentElement(){return this.parent}get options(){return this.children.filter(c=>c.tag==='option')}
  append(...ns){for(const n of ns){this.children.push(n);if(n&&typeof n==='object')n.parent=this}}
  prepend(...ns){this.children.unshift(...ns)}replaceChildren(...ns){this.children=[];this._text='';this.append(...ns)}
  setAttribute(k,v){this.attrs[k]=String(v);if(k==='id')this.id=String(v);if(k==='class')this.className=v;if(k.startsWith('data-'))this.dataset[k.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=String(v)}getAttribute(k){return this.attrs[k]??null}removeAttribute(k){delete this.attrs[k]}
  addEventListener(k,f){(this.events[k]||=[]).push(f)}fire(k,event={}){const e={target:this,preventDefault(){},...event};return Promise.all((this.events[k]||[]).map(f=>f(e)))}click(){return this.fire('click')}focus(){this.doc.activeElement=this}scrollIntoView(){}remove(){if(this.parent)this.parent.children=this.parent.children.filter(c=>c!==this)}showModal(){this.open=true}close(){this.open=false;this.fire('close')}
  querySelectorAll(s){return flatten(this).slice(1).filter(n=>s.split(',').some(sel=>matches(n,sel.trim())))}querySelector(s){return this.querySelectorAll(s)[0]||null}
  closest(s){return matches(this,s)?this:this.parent?.closest(s)||null}
}
const flatten=n=>[n,...n.children.filter(c=>c&&typeof c==='object').flatMap(flatten)];
function matches(n,s){if(s.startsWith('#'))return n.id===s.slice(1);if(s.startsWith('.'))return n.classList.contains(s.slice(1));const m=s.match(/^(\w+)?(?:\[([^=\]]+)(?:="([^"]+)")?\])?$/);if(!m)return false;if(m[1]&&n.tag!==m[1])return false;if(!m[2])return true;const key=m[2],value=key.startsWith('data-')?n.dataset[key.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]:n.attrs[key];return value!==undefined&&(m[3]===undefined||value===m[3])}
function createDOM(html){const doc={nodes:{},activeElement:null,createElement:t=>new Element(t,doc),createElementNS:(_,t)=>new Element(t,doc),createTextNode:s=>String(s),getElementById:id=>doc.nodes[id]||null};doc.body=new Element('body',doc);doc.head=new Element('head',doc);doc.body.dataset.collectionOnly=html.includes('data-collection-only="true"')?'true':'false';doc.body.dataset.game=html.match(/data-game="([^"]+)"/)?.[1];doc.body.dataset.quiz=html.match(/data-quiz="([^"]+)"/)?.[1];doc.querySelectorAll=s=>flatten(doc.body).filter(n=>s.split(',').some(sel=>matches(n,sel.trim())));doc.querySelector=s=>doc.querySelectorAll(s)[0]||null;
  for(const m of html.matchAll(/<(\w+)[^>]*\bid="([^"]+)"[^>]*>/g)){const n=doc.createElement(m[1]);n.id=m[2];for(const a of m[0].matchAll(/([\w-]+)="([^"]*)"/g))n.setAttribute(a[1],a[2]);n.hidden=/\shidden(?:\s|>)/.test(m[0]);n.disabled=/\sdisabled(?:\s|>)/.test(m[0]);doc.body.append(n)}
  const menu=doc.createElement('button');menu.className='menu-toggle';doc.body.append(menu);const status=doc.createElement('div');status.className='game-status';doc.body.append(status);
  if(html.includes('class="report-open"')){const report=doc.createElement('button');report.className='report-open';doc.body.append(report);}
  if(html.includes('class="map-panel"')){const panel=doc.createElement('section');panel.className='map-panel';doc.body.append(panel);}
  if(doc.nodes['recognition-form'])doc.nodes['recognition-form'].append(doc.createElement('button'));
  if(doc.nodes['recognition-next'])doc.nodes['recognition-next'].append(doc.createElement('span'));
  if(doc.nodes['answer-source'])doc.nodes['answer-source'].append(doc.createElement('span'));
  if(doc.nodes['next-question'])doc.nodes['next-question'].append(doc.createElement('span'));
  return doc;
}
module.exports={Element,createDOM,flatten,matches};
