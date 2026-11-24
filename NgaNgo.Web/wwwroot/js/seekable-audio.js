import { googleClip, splitSpeech } from './google-voice.js';
export function pcmWave(chunks,sampleRate){
 const length=chunks.reduce((sum,c)=>sum+c.length,0),buffer=new ArrayBuffer(44+length*2),view=new DataView(buffer);
 const str=(offset,text)=>[...text].forEach((c,i)=>view.setUint8(offset+i,c.charCodeAt(0)));
 str(0,'RIFF');view.setUint32(4,36+length*2,true);str(8,'WAVE');str(12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);view.setUint32(24,sampleRate,true);view.setUint32(28,sampleRate*2,true);view.setUint16(32,2,true);view.setUint16(34,16,true);str(36,'data');view.setUint32(40,length*2,true);
 let offset=44;for(const chunk of chunks)for(const sample of chunk){const n=Math.max(-1,Math.min(1,sample));view.setInt16(offset,n<0?n*32768:n*32767,true);offset+=2;}
 return new Blob([buffer],{type:'audio/wav'});
}
export async function seekableClip(text,signal,onStatus=()=>{}){
 const parts=splitSpeech(text);if(!parts.length)throw new Error('There is no text to read.');
 if(parts.length===1)return googleClip(parts[0],signal);
 const Context=globalThis.AudioContext||globalThis.webkitAudioContext;
 if(!Context)throw new Error('This device cannot prepare passage audio. Try an original textbook recording.');
 const context=new Context(),chunks=[];
 try{
  for(let i=0;i<parts.length;i++){
   if(signal.aborted)throw new DOMException('Canceled','AbortError');
   onStatus(`Preparing audio ${i+1} / ${parts.length}…`);
   const blob=await googleClip(parts[i],signal),decoded=await context.decodeAudioData(await blob.arrayBuffer());
   const mono=new Float32Array(decoded.length);
   for(let channel=0;channel<decoded.numberOfChannels;channel++){
    const data=decoded.getChannelData(channel);for(let n=0;n<data.length;n++)mono[n]+=data[n]/decoded.numberOfChannels;
   }chunks.push(mono);
  }
  return pcmWave(chunks,context.sampleRate);
 }finally{await context.close();}
}
export const playerMarkup=()=>`<div class="seekable-player"><audio id="practice-audio" controls playsinline preload="metadata" aria-label="Russian practice audio"></audio><div class="audio-tools"><button class="btn secondary small" data-action="seek" data-seconds="-5">↶ 5 s</button><button class="btn secondary small" data-action="seek" data-seconds="5">5 s ↷</button><label class="check-row"><input type="checkbox" id="practice-loop">Repeat audio</label></div></div>`;
