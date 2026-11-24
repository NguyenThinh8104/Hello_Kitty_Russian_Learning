// Integration tests use a local LanguageTool fixture: no real learner data or API key.
import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
let lastPayload='', providerStatus=200,voiceCalls=0;
const fixture=http.createServer((req,res)=>{
 if(req.url.startsWith('/tts')){voiceCalls++;res.writeHead(providerStatus,{'Content-Type':providerStatus===200?'audio/mpeg':'text/plain'});res.end(Buffer.from('ID3fixture'));return;}
 let data=''; req.on('data',chunk=>data+=chunk); req.on('end',()=>{
  lastPayload=data;
  res.writeHead(providerStatus,{'Content-Type':'application/json'});
  res.end(JSON.stringify({matches:[{message:'Проверьте согласование.',offset:3,length:3,replacements:[{value:'учусь'}],rule:{id:'RU_TEST'}}]}));
 });
});
await new Promise(resolve=>fixture.listen(5191,'127.0.0.1',resolve));
const server=spawn('dotnet',[path.join(root,'NgaNgo.Web/bin/Debug/net9.0/NgaNgo.Web.dll')],{
 cwd:path.join(root,'NgaNgo.Web'),env:{...process.env,ASPNETCORE_URLS:'http://127.0.0.1:5190',ASPNETCORE_ENVIRONMENT:'Development',LanguageTool__Endpoint:'http://127.0.0.1:5191/check',GoogleVoice__Endpoint:'http://127.0.0.1:5191/tts',Speech__ApiKey:''},stdio:'pipe'
});
let serverOutput=''; server.stderr.on('data',data=>serverOutput+=data);
const base='http://127.0.0.1:5190';
let started=false;
for(let attempt=0;attempt<60;attempt++){
 try{const r=await fetch(base+'/api/health',{signal:AbortSignal.timeout(1000)});if(r.ok){started=true;break;}}catch{}
 await new Promise(resolve=>setTimeout(resolve,200));
}
if(!started){server.kill();fixture.close();throw new Error('API did not start: '+serverOutput);}
const post=(value,headers={})=>fetch(base+'/api/writing/check',{method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify(value)});
try {
 await test('health, capabilities and complete app shell',async()=>{
  assert.equal((await (await fetch(base+'/api/health')).json()).status,'ok');
  assert.equal((await (await fetch(base+'/api/capabilities')).json()).transcription,false);
  for(const file of ['/aymi.css','/polish.css','/images/aymi-wallpaper.png','/js/enhancements.js','/js/i18n.js','/js/vocabulary-data.js','/js/russian-feedback.js','/js/speaking-topics.js','/js/grammar-content.js','/fonts/NotoSans.ttf','/images/aymi-logo-original.png','/images/vocabulary/emoji_u1f4d6.svg'])assert.equal((await fetch(base+file)).status,200,file);
  for(const file of ['/','/styles.css','/practice-ui.css','/hello-kitty.css','/images/hello-kitty-study.png','/js/app.js','/js/content.js','/js/curriculum.js','/js/exercise-bank.js','/js/exercise-bank-late.js','/js/sessions.js','/js/dialogs.js','/js/book-audio.js','/manifest.webmanifest','/icons/icon-192.png','/icons/icon-512.png','/icons/apple-touch-icon.png','/sw.js']) assert.equal((await fetch(base+file)).status,200,file);
 });
 await test('writing requires consent, nonempty text and length limits',async()=>{
  for(const value of [{text:'Я учусь.',consent:false},{text:' ',consent:true},{text:'я'.repeat(5001),consent:true}]) assert.equal((await post(value)).status,400);
 });
 await test('writing POST forwards Russian with UTF-8 and safely shapes provider corrections',async()=>{
  const response=await post({text:'Я учу русский язык.',consent:true});
  assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'no-store');
  const result=await response.json();assert.deepEqual(result.matches[0].replacements,['учусь']);
  assert.equal(result.matches[0].offset,3);assert.equal(new URLSearchParams(lastPayload).get('language'),'ru');
  assert.equal(new URLSearchParams(lastPayload).get('text'),'Я учу русский язык.');
 });
 await test('cross-origin requests fail before forwarding to provider',async()=>{assert.equal((await post({text:'Текст',consent:true},{Origin:'https://foreign.example'})).status,403);});
 await test('speech without a configured server key returns an actionable failure',async()=>{const r=await fetch(base+'/api/speech/transcribe',{method:'POST'});assert.equal(r.status,503);assert.ok((await r.json()).error);});
 await test('Google voice validates chunks, forwards MP3 and caches replays',async()=>{
  const voice=text=>fetch(base+'/api/tts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text})});
  for(const text of ['', 'я'.repeat(181)])assert.equal((await voice(text)).status,400);
  for(let i=0;i<2;i++){const r=await voice('Привет!');assert.equal(r.status,200);const result=await r.json();assert.equal(result.provider,'Google Translate');assert.equal(Buffer.from(result.audio,'base64').toString(),'ID3fixture');}
  assert.equal(voiceCalls,1);
  providerStatus=503;assert.equal((await voice('Здравствуйте!')).status,502);providerStatus=200;
 });
 await test('the private local PDF supports partial reads without bundling in static assets',async()=>{
  const caps=await (await fetch(base+'/api/capabilities')).json();
  const response=await fetch(base+'/api/textbook',{headers:{Range:'bytes=0-3'}});
  if(caps.textbook){assert.equal(response.status,206);assert.equal(await response.text(),'%PDF');}
  else assert.equal(response.status,404);
  assert.equal((await fetch(base+'/App_Data/2017-a1.pdf')).status,404);
 });
 await test('upstream errors and rate limits remain failures rather than false clean results',async()=>{
  for(const [upstream,expected] of [[503,502],[429,429]]){providerStatus=upstream;const r=await post({text:'Текст',consent:true});assert.equal(r.status,expected);assert.ok((await r.json()).error);}
  providerStatus=200;
 });
 await test('rate limit bounds online requests',async()=>{let limited=false;for(let i=0;i<12;i++){const r=await post({text:'Текст',consent:true});if(r.status===429){limited=true;break;}}assert.ok(limited);});
} finally {server.kill();fixture.close();}
