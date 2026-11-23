import { googleClip, splitSpeech } from './google-voice.js';
import { runtime } from './platform.js';
// Google Translate playback; iOS uses native speech recognition and recording.
export class AudioPractice {
  constructor(onStatus,onError=()=>{}) { this.onStatus = onStatus; this.onError=onError; this.urls = []; this.active = true; }
  fail(message,title,code) { if(!this.active)return; this.onStatus(message); this.onError({title,message,code}); }
  async speak(text, rate = .85, onEnd = () => {}) {
    if (this.recognition || this.recorder?.state === 'recording') { this.onStatus('Stop the microphone before playing a model.'); return; }
    this.stopSpeech();
    const controller=new AbortController();this.speechController=controller;
    const stopped=()=>controller.signal.aborted||!this.active;
    try {
      this.onStatus('Loading Google Translate voice…');
      for(const part of splitSpeech(text)) {
        const blob=await googleClip(part,controller.signal);if(stopped())return;
        const url=URL.createObjectURL(blob), player=new Audio(url);this.player=player;this.playerUrl=url;
        player.playbackRate=rate;player.preservesPitch=true;
        await new Promise((resolve,reject)=>{
          this.finishPlayback=resolve;player.onended=resolve;player.onerror=()=>reject(new Error('Google Translate audio could not play. Please try again.'));
          this.onStatus('Playing Google Translate voice · Russian…');
          player.play().catch(reject);
        });
        URL.revokeObjectURL(url);this.playerUrl=null;if(stopped())return;
      }
      this.onStatus('Finished. Replay as often as you like.');onEnd();
    } catch(error) {
      if(!stopped()){const message=error.name==='NotAllowedError'?'Tap Listen again to allow audio playback.':/fetch|network/i.test(error.message||'')?'Could not reach Google Translate. Check your connection and retry.':error.message||'Google Translate audio is unavailable. Please try again.';this.fail(message,'Google Translate voice unavailable','voice');onEnd();}
    } finally { if(this.speechController===controller){this.player=null;this.finishPlayback=null;if(this.playerUrl)URL.revokeObjectURL(this.playerUrl);this.playerUrl=null;} }
  }
  stopSpeech() { this.speechController?.abort();this.player?.pause();this.finishPlayback?.();if(this.playerUrl)URL.revokeObjectURL(this.playerUrl);this.playerUrl=null;this.player=null; }
  recognize(onText, onEnd) {
    if(runtime()?.recognize) {
      if(this.recorder?.state==='recording'){this.onStatus('Stop recording first.');return false;}
      this.stopSpeech();let final='';
      const session=runtime().recognize(text=>{final=text;if(this.active)onText(text,'');},()=>{this.recognition=null;if(this.active)onEnd(final);},error=>this.fail(error,'Speech recognition unavailable','microphone'));
      this.recognition=session;this.onStatus('Listening for Russian… Tap Stop when you finish.');return true;
    }
    if (!window.isSecureContext) { this.fail('The browser preview needs a trusted HTTPS connection to use the microphone on iPad.','Microphone unavailable','microphone'); return false; }
    if (this.recorder?.state === 'recording') { this.onStatus('Stop recording first.'); return false; }
    const Recognition = runtime()?.platform==='windows' ? null : window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) { this.fail('Live recognition is unavailable here. Use Record to listen back to your own voice.','Try recording yourself','microphone'); return false; }
    this.stopSpeech();
    const recognition = new Recognition(); this.recognition = recognition;
    recognition.lang = 'ru-RU'; recognition.interimResults = true; recognition.continuous = false;
    let final = '';
    recognition.onresult = event => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += text + ' '; else interim += text;
      }
      if (this.active) onText(final.trim(), interim);
    };
    const errors = { 'not-allowed':'Microphone or speech recognition permission was denied. Check your app or browser permissions.', 'audio-capture':'No microphone was found.', 'no-speech':'No speech detected. Please try again.', 'network':'Speech recognition needs Internet. Check your connection.', 'language-not-supported':'Russian speech recognition is unavailable on this device.' };
    recognition.onerror = event => { if (this.active && event.error!=='aborted') this.fail(errors[event.error] || 'Speech recognition was interrupted. Try recording yourself.','Speech recognition unavailable','microphone'); };
    let finished = false;
    const finish = () => { if (finished) return; finished = true; clearTimeout(this.recognitionTimer); clearTimeout(this.abortTimer); this.recognition = null; if (this.active) onEnd(final.trim()); };
    recognition.onend = finish;
    try {
      recognition.start(); this.onStatus('Listening for Russian… Tap Stop when you finish.');
      this.recognitionTimer = setTimeout(() => { recognition.abort(); finish(); if (this.active) this.onStatus('Stopped after 20 seconds. If no text appears, try Record.'); }, 20000);
      this.finishRecognition = finish;
      return true;
    } catch { this.recognition = null; this.fail('Recognition could not start. Try Record or reopen the app.','Recognition could not start','microphone'); return false; }
  }
  stopRecognition() { if (!this.recognition) return; this.recognition.stop(); this.abortTimer = setTimeout(() => { this.recognition?.abort(); this.finishRecognition?.(); },1500); }
  async record(onDone, onStop) {
    if(runtime()?.record) {
      if(this.recognition){this.onStatus('Stop recognition first.');return false;}
      this.stopSpeech();
      try {
        const recorder=await runtime().record(blob=>{clearTimeout(this.recordTimer);if(this.active&&blob.size){const url=URL.createObjectURL(blob);this.urls.push(url);onDone(blob,url);this.onStatus('Recording saved for playback on this device.');}if(this.active)onStop();});
        this.recorder=recorder;if(!this.active){recorder.stop();return false;}
        this.recordTimer=setTimeout(()=>this.stopRecord(),30000);this.onStatus('Recording… Up to 30 seconds.');return true;
      }catch(error){this.fail(error.message||'Could not open the microphone. Check permissions in Settings.','Allow microphone access to practice','microphone');return false;}
    }
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) { this.fail('The browser preview needs HTTPS and microphone permission. Localhost works only on the computer running the preview.','Microphone unavailable','microphone'); return false; }
    if (!window.MediaRecorder) { this.fail('Recording is unavailable in this browser. Try a newer browser.','Recording unavailable on this device','microphone'); return false; }
    if (this.recognition) { this.onStatus('Stop recognition first.'); return false; }
    this.stopSpeech();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!this.active) { stream.getTracks().forEach(t => t.stop()); return false; }
      this.stream = stream;
      const mime = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus'].find(t => MediaRecorder.isTypeSupported(t));
      const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined); this.recorder = recorder;
      const chunks = [];
      recorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
      recorder.onstop = () => {
        clearTimeout(this.recordTimer); stream.getTracks().forEach(t => t.stop()); this.stream = null;
        const blob = new Blob(chunks, { type: recorder.mimeType || mime || 'audio/mp4' });
        if (this.active && blob.size) { const url = URL.createObjectURL(blob); this.urls.push(url); onDone(blob, url); this.onStatus('Recorded. The clip stays on your device until you choose to send it online.'); }
        if (this.active) onStop();
      };
      recorder.onerror = () => { this.stopRecord(); this.fail('Recording did not finish. Check the microphone and try again.','Recording interrupted','microphone'); };
      recorder.start(); this.onStatus('Recording… Up to 30 seconds.');
      this.recordTimer = setTimeout(() => this.stopRecord(), 30000);
      return true;
    } catch { this.stream?.getTracks().forEach(t => t.stop()); this.fail('Could not access the microphone. Check your app or browser permissions and retry.','Allow microphone access to practice','microphone'); return false; }
  }
  stopRecord() { if (this.recorder?.state === 'recording') this.recorder.stop(); }
  dispose() {
    this.active = false; clearTimeout(this.recordTimer); clearTimeout(this.recognitionTimer); clearTimeout(this.abortTimer);
    this.recognition?.abort(); this.stopRecord(); this.stream?.getTracks().forEach(t => t.stop()); this.stopSpeech();
    this.urls.forEach(url => URL.revokeObjectURL(url));
  }
}
