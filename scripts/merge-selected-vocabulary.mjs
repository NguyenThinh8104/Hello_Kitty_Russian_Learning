import { lessons } from '../NgaNgo.Web/wwwroot/js/content.js';
import { readFile,writeFile } from 'node:fs/promises';
const path=new URL('./vocabulary-source.json',import.meta.url),data=JSON.parse(await readFile(path,'utf8'));
for(const lesson of lessons){const words=new Set(data[lesson.id].split('|'));for(const[word]of lesson.vocab)words.add(word.normalize('NFC').replace(/\u0301/g,''));data[lesson.id]=[...words].join('|');}
await writeFile(path,JSON.stringify(data,null,2)+'\n');
