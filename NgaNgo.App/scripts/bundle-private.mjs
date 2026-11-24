import { copyFile, mkdir, access, writeFile, cp } from 'node:fs/promises';
const target = new URL('../dist/', import.meta.url);
const web = new URL('../../NgaNgo.Web/wwwroot/', import.meta.url);
await mkdir(new URL('icons/', target), { recursive:true });
for(const name of ['icon.svg','manifest.webmanifest','icons/apple-touch-icon.png']) await copyFile(new URL(name, web),new URL(name,target));
for(const name of ['images','icons','licenses'])await cp(new URL(name,web),new URL(name,target),{recursive:true});
let textbook=false;
try {
  const pdf=new URL('../../NgaNgo.Web/App_Data/2017-a1.pdf',import.meta.url);
  await access(pdf); await copyFile(pdf,new URL('textbook.pdf',target)); textbook=true;
} catch(error) { if(error.code!=='ENOENT') throw error; }
await writeFile(new URL('bundle-info.json',target),JSON.stringify({textbook}));
console.log(`Installed app assets ready; private textbook: ${textbook}.`);
