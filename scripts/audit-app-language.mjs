import{parse}from'../NgaNgo.App/node_modules/@babel/parser/lib/index.js';
import{readFile,readdir}from'node:fs/promises';
import{vietnamese}from'../NgaNgo.Web/wwwroot/js/i18n-dictionary.js';
const root=new URL('../NgaNgo.Web/wwwroot/',import.meta.url);
for(const name of ['Overview','Vocabulary','Grammar','Speaking topics','Settings','Check answers','Interface language'])if(!vietnamese[name])throw new Error('Missing Vietnamese label: '+name);
let count=0;for(const file of await readdir(new URL('js/',root))){if(file.endsWith('.js')){parse(await readFile(new URL('js/'+file,root),'utf8'),{sourceType:'module'});count++;}}
console.log(`${count} JavaScript modules parsed; English/Vietnamese navigation labels verified.`);
