import test from 'node:test';
import assert from 'node:assert/strict';
import { AudioPractice } from '../NgaNgo.Web/wwwroot/js/audio.js';

function browserFixture(){
 const names=['window','speechSynthesis'];
 const previous=names.map(name=>[name,Object.getOwnPropertyDescriptor(globalThis,name)]);
 class Recognition{
  start(){}
  stop(){this.onend?.();}
  abort(){this.onerror?.({error:'aborted'});this.onend?.();}
 }
 Object.defineProperty(globalThis,'window',{configurable:true,value:{isSecureContext:true,speechSynthesis:{},SpeechRecognition:Recognition}});
 Object.defineProperty(globalThis,'speechSynthesis',{configurable:true,value:{cancel(){},getVoices(){return[];}}});
 return ()=>{for(const[name,descriptor]of previous){if(descriptor)Object.defineProperty(globalThis,name,descriptor);else delete globalThis[name];}};
}
test('Google Translate failure emits a structured error without falling back to system voices',async()=>{
 const restore=browserFixture(),errors=[],statuses=[];const audio=new AudioPractice(text=>statuses.push(text),error=>errors.push(error));
 const previous=globalThis.fetch;globalThis.fetch=async()=>new Response(JSON.stringify({error:'Google Translate chưa phát được giọng Nga.'}),{status:502});
 try{await audio.speak('Привет!');assert.equal(errors.length,1);assert.equal(errors[0].code,'voice');assert.ok(errors[0].message.includes('Google Translate'));assert.equal(statuses.length,2);}
 finally{audio.dispose();globalThis.fetch=previous;restore();}
});
test('an intentional recognition abort never opens an error popup',()=>{
 const restore=browserFixture(),errors=[];const audio=new AudioPractice(()=>{},error=>errors.push(error));
 try{assert.ok(audio.recognize(()=>{},()=>{}));audio.recognition.abort();assert.deepEqual(errors,[]);assert.equal(audio.recognition,null);}
 finally{audio.dispose();restore();}
});
test('denied microphone access emits the microphone help action without exposing internals',()=>{
 const restore=browserFixture(),errors=[];const audio=new AudioPractice(()=>{},error=>errors.push(error));
 try{audio.recognize(()=>{},()=>{});audio.recognition.onerror({error:'not-allowed'});assert.equal(errors[0].code,'microphone');assert.match(errors[0].message,/permission/i);}
 finally{audio.dispose();restore();}
});

test('native iPad recognition uses the OS bridge without requiring browser SpeechRecognition',()=>{
 const restore=browserFixture();let ended=false,started=false;
 window.ngaNgoNative={recognize(onText,onEnd){started=true;onText('Привет');return {stop(){onEnd();},abort(){onEnd();}};}};
 const audio=new AudioPractice(()=>{});let text;
 try{assert.ok(audio.recognize(value=>text=value,()=>ended=true));assert.ok(started);assert.equal(text,'Привет');audio.stopRecognition();assert.ok(ended);}
 finally{audio.dispose();restore();}
});

test('stopping while Google audio is loading prevents stale playback and error popups',async()=>{
 const restore=browserFixture(),previous=globalThis.fetch,errors=[];
 let finish;globalThis.fetch=()=>new Promise(resolve=>finish=resolve);
 const audio=new AudioPractice(()=>{},e=>errors.push(e));
 try{const pending=audio.speak('Здравствуйте!');audio.stopSpeech();finish(new Response(JSON.stringify({audio:'SUQz'})));await pending;assert.deepEqual(errors,[]);assert.equal(audio.player,null);}
 finally{audio.dispose();globalThis.fetch=previous;restore();}
});
