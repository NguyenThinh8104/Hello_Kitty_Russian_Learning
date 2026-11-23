import{parse}from'../NgaNgo.App/node_modules/@babel/parser/lib/index.js';
import{readFile,readdir}from'node:fs/promises';
const root=new URL('../',import.meta.url);
const accent=/[\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u024f\u1e00-\u1eff]/u;
let count=0;
for(const file of await readdir(new URL('NgaNgo.Web/wwwroot/js/',root))){
 if(!file.endsWith('.js'))continue;
 const ast=parse(await readFile(new URL('NgaNgo.Web/wwwroot/js/'+file,root),'utf8'),{sourceType:'module'});
 function visit(n){if(!n||typeof n!=='object')return;
  if(n.type==='StringLiteral'||n.type==='TemplateElement'){
   const value=n.type==='StringLiteral'?n.value:n.value.raw;
   if(accent.test(value)||/\b(Nghe|Sau|Nga|Nam|khoa|phim|ngon)\b/.test(value)||value.includes('anh/em trai')){console.log(file+': '+value.slice(0,300));count++;}return;
  }
  for(const v of Object.values(n))if(Array.isArray(v))v.forEach(visit);else if(v&&typeof v==='object')visit(v);
 }visit(ast);
}
console.log('Potential remaining Vietnamese strings: '+count);
