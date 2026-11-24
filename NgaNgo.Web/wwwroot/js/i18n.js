import { vietnamese } from './i18n-dictionary.js';
let language='en';
try{language=localStorage.getItem('aymi-language-v1')==='vi'?'vi':'en';}catch{}
const originals=new WeakMap(),attributes=new WeakMap();
const escape=value=>value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const keys=Object.keys(vietnamese).filter(k=>k.length>1).sort((a,b)=>b.length-a.length);
const matcher=new RegExp('(^|[^A-Za-z])('+keys.map(escape).join('|')+')(?=$|[^A-Za-z])','g');
export const getLanguage=()=>language;
export const localized=value=>typeof value==='object'&&value!==null?(value[language]??value.en??value.ru??''):value;
export function t(value,vi){
 if(language==='en'||typeof value!=='string')return value;
 if(vi!==undefined)return vi;
 if(vietnamese[value]!==undefined)return vietnamese[value];
 return value.replace(matcher,(all,prefix,key)=>prefix+vietnamese[key]);
}
function ignored(node){return node.parentElement?.closest('script,style,textarea,code,[data-no-i18n],[data-user-content]');}
export function localize(root=document.body){
 if(!root)return;
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
 while(walker.nextNode()){
  const node=walker.currentNode;if(ignored(node)||!node.nodeValue.trim())continue;
  let entry=originals.get(node);
  if(!entry||node.nodeValue!==entry.last)entry={source:node.nodeValue,last:node.nodeValue};
  const next=t(entry.source);if(node.nodeValue!==next)node.nodeValue=next;
  entry.last=next;originals.set(node,entry);
 }
 for(const node of root.querySelectorAll('[aria-label],[placeholder],[title]')){
  if(node.closest('[data-no-i18n],[data-user-content]'))continue;
  let entries=attributes.get(node)||{};
  for(const name of ['aria-label','placeholder','title']){
   if(!node.hasAttribute(name))continue;
   const value=node.getAttribute(name);let entry=entries[name];
   if(!entry||value!==entry.last)entry={source:value,last:value};
   const next=t(entry.source);if(value!==next)node.setAttribute(name,next);
   entry.last=next;entries[name]=entry;
  }attributes.set(node,entries);
 }
 document.documentElement.lang=language;
}
export function setLanguage(next){
 language=next==='vi'?'vi':'en';try{localStorage.setItem('aymi-language-v1',language);}catch{}
 localize();window.dispatchEvent(new CustomEvent('aymi-language-change',{detail:language}));
}
let scheduled=false;
export function initializeLanguage(){
 localize();
 new MutationObserver(()=>{if(scheduled)return;scheduled=true;queueMicrotask(()=>{scheduled=false;localize();});})
  .observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['aria-label','placeholder','title']});
}
