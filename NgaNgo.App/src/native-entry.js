import { Capacitor, CapacitorHttp } from '@capacitor/core';
import { SpeechRecognition } from '@capgo/capacitor-speech-recognition';
import { VoiceRecorder } from 'capacitor-voice-recorder';
import { FileViewer } from '@capacitor/file-viewer';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { createProviders } from './providers.mjs';

if(Capacitor.isNativePlatform()) {
  const providers=createProviders(async(url,options)=>{
    const response=await CapacitorHttp.request({url,method:options.method,
      headers:options.body?{'Content-Type':'application/x-www-form-urlencoded'}:{},
      data:options.body,responseType:options.binary?'arraybuffer':'json',connectTimeout:15000,readTimeout:25000});
    return {...response,contentType:Object.entries(response.headers).find(([k])=>k.toLowerCase()==='content-type')?.[1]};
  });
  const info=await fetch('./bundle-info.json').then(r=>r.json());
  const importedPath='russian-kitty-textbook.pdf';let importedTextbook=false;
  try{await Filesystem.stat({path:importedPath,directory:Directory.Documents});importedTextbook=true;}catch{}
  window.ngaNgoNative={
    platform:'ios',
    async request(path,body) {
      if(path==='/api/capabilities')return {status:200,data:{textbook:info.textbook||importedTextbook,transcription:false,nativeSpeech:true,ttsProvider:'Google Translate',writingProvider:'LanguageTool'}};
      return providers(path,body);
    },
    async openTextbook() {
      if(importedTextbook){const file=await Filesystem.getUri({path:importedPath,directory:Directory.Documents});await FileViewer.openDocumentFromLocalPath({path:file.uri});}
      else await FileViewer.openDocumentFromResources({path:'public/textbook.pdf'});
    },
    async importTextbook(file) {
      if(file.size>60*1024*1024||await file.slice(0,5).text()!=='%PDF-')throw new Error('Choose a valid PDF file up to 60 MB.');
      const data=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.onerror=()=>reject(new Error('The PDF could not be read.'));reader.readAsDataURL(file);});
      await Filesystem.writeFile({path:importedPath,data,directory:Directory.Documents});importedTextbook=true;
    },
    async exportBackup(text,name) {
      const file=await Filesystem.writeFile({path:name,data:text,encoding:Encoding.UTF8,directory:Directory.Cache});
      await Share.share({title:'Aymi Russian · Backup',files:[file.uri],dialogTitle:'Save backup'});
    },
    recognize(onText,onEnd,onError,seconds=20) {
      let ended=false,started=false,timer,listeners=[];
      const finish=async()=>{if(ended)return;ended=true;clearTimeout(timer);for(const handle of listeners)await handle.remove();listeners=[];onEnd();};
      const stop=async()=>{if(ended)return;if(started){try{await SpeechRecognition.stop();}catch{}}await finish();};
      const session={stop,abort:stop};
      void(async()=>{
        try {
          if(!(await SpeechRecognition.available()).available)throw new Error('Speech recognition is unavailable on this device. Try Record instead.');
          if((await SpeechRecognition.requestPermissions()).speechRecognition!=='granted')throw new Error('Allow Microphone and Speech Recognition for Aymi Russian in Settings.');
          if(ended)return;
          listeners.push(await SpeechRecognition.addListener('partialResults',event=>{if(!ended&&event.matches?.[0])onText(event.matches[0]);}));
          listeners.push(await SpeechRecognition.addListener('listeningState',event=>{if(event.status==='stopped')void finish();}));
          listeners.push(await SpeechRecognition.addListener('error',()=>{if(!ended){onError('Recognition was interrupted. Check your connection and microphone permission, then retry.');void stop();}}));
          if(ended){for(const handle of listeners)await handle.remove();return;}
          started=true;
          await SpeechRecognition.start({language:'ru-RU',partialResults:true,popup:false,preferLegacyRecognizer:true});
          if(ended){await SpeechRecognition.stop();return;}
          timer=setTimeout(()=>void stop(),Math.min(180,Math.max(20,seconds))*1000);
        }catch(error){if(!ended){onError(error.message||'Russian speech recognition could not start.');await finish();}}
      })();
      return session;
    },
    async record(onDone) {
      if(!(await VoiceRecorder.requestAudioRecordingPermission()).value)throw new Error('Allow Microphone for Aymi Russian in Settings.');
      await VoiceRecorder.startRecording();
      const recorder={state:'recording',async stop(){
        if(recorder.state!=='recording')return;recorder.state='inactive';
        try {const result=(await VoiceRecorder.stopRecording()).value;
          onDone(new Blob([Uint8Array.from(atob(result.recordDataBase64||''),c=>c.charCodeAt(0))],{type:result.mimeType}));
        }catch {onDone(new Blob([]));}
      }};
      return recorder;
    }
  };
}
await import('../../NgaNgo.Web/wwwroot/js/app.js');
