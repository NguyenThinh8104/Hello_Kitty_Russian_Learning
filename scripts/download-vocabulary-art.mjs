import { illustrationCodes } from '../NgaNgo.Web/wwwroot/js/vocabulary-art.js';
import { mkdir,writeFile,access } from 'node:fs/promises';
const root=new URL('../NgaNgo.Web/wwwroot/',import.meta.url);
await mkdir(new URL('images/vocabulary/',root),{recursive:true});await mkdir(new URL('licenses/',root),{recursive:true});
for(let i=0;i<illustrationCodes.length;i+=5){
 await Promise.all(illustrationCodes.slice(i,i+5).map(async code=>{
  const name=`emoji_u${code}.svg`,target=new URL(`images/vocabulary/${name}`,root);
  try{await access(target);return;}catch{}
  let response=await fetch(`https://raw.githubusercontent.com/googlefonts/noto-emoji/main/2D/svg/${name}`);
  if(response.status===404)response=await fetch(`https://raw.githubusercontent.com/googlefonts/noto-emoji/main/2D/svg/emoji_u${code}_fe0f.svg`);
  if(!response.ok)throw new Error(`${name}: ${response.status}`);
  await writeFile(target,await response.text());
 }));
}const license=await fetch('https://raw.githubusercontent.com/googlefonts/noto-emoji/main/LICENSE');
if(!license.ok)throw new Error('Could not fetch illustration license');await writeFile(new URL('licenses/noto-emoji.txt',root),await license.text());
console.log(`${illustrationCodes.length} offline illustrations ready.`);
