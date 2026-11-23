import test from 'node:test';
import assert from 'node:assert/strict';
import {createProviders} from '../NgaNgo.App/src/providers.mjs';
import {splitSpeech} from '../NgaNgo.Web/wwwroot/js/google-voice.js';

test('Google voice splits long Russian passages without losing text or sending stress marks',()=>{
 const original='Приве́т! '+('Я изучаю русский язык и живу в Москве. '.repeat(30));
 const parts=splitSpeech(original);
 assert.ok(parts.length>1);assert.ok(parts.every(p=>p.length<=180&&p.length>0));
 assert.equal(parts.join(' '),original.normalize('NFC').replace(/\u0301/g,'').trim());
 assert.deepEqual(splitSpeech(''),[]);assert.ok(splitSpeech('я'.repeat(400)).every(p=>p.length<=180));
});
test('native Google adapter fixes Russian locale, encodes text and reuses the returned MP3',async()=>{
 let calls=0;const request=createProviders(async(url,options)=>{
  calls++;const parsed=new URL(url);assert.equal(parsed.origin,'https://translate.google.com');assert.equal(parsed.searchParams.get('tl'),'ru');assert.equal(parsed.searchParams.get('q'),'Привет!');assert.ok(options.binary);
  return {status:200,contentType:'audio/mpeg',data:'SUQz'};
 });
 const first=await request('/api/tts',{text:'Приве́т!'}),second=await request('/api/tts',{text:'Привет!'});
 assert.equal(first.status,200);assert.equal(first.data.provider,'Google Translate');assert.equal(second.data.audio,first.data.audio);assert.equal(calls,1);
});
test('native adapter rejects missing consent, oversized requests and arbitrary routes without network',async()=>{
 const request=createProviders(()=>assert.fail('must not send'));
 assert.equal((await request('/api/writing/check',{text:'Текст',consent:false})).status,400);
 assert.equal((await request('/api/writing/check',{text:'я'.repeat(5001),consent:true})).status,400);
 assert.equal((await request('/api/tts',{text:'я'.repeat(181)})).status,400);
 assert.equal((await request('https://evil.example/',{})).status,404);
});
test('native LanguageTool preserves UTF-8 and returns corrections in the existing app format',async()=>{
 const request=createProviders(async(url,options)=>{
  assert.equal(url,'https://api.languagetool.org/v2/check');const form=new URLSearchParams(options.body);assert.equal(form.get('language'),'ru');assert.equal(form.get('text'),'Я жыву в Москве.');
  return {status:200,data:{matches:[{message:'Проверьте слово.',offset:2,length:4,replacements:[{value:'живу'}],rule:{id:'RU_SPELLING'}}]}};
 });
 const result=await request('/api/writing/check',{text:'Я жыву в Москве.',consent:true});assert.equal(result.status,200);assert.deepEqual(result.data.matches[0].replacements,['живу']);
});
test('provider outages and non-audio Google replies are failures, never empty success',async()=>{
 for(const response of [{status:429},{status:200,data:'<html>',contentType:'text/html'}]){
  const request=createProviders(async()=>response);assert.equal((await request('/api/tts',{text:'Привет'})).status,502);
 }
 const request=createProviders(async()=>({status:429}));assert.equal((await request('/api/writing/check',{text:'Я учусь.',consent:true})).status,429);
});
