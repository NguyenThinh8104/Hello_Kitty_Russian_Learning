import { googleClip, splitSpeech } from './google-voice.js';
import { runtime } from './platform.js';
// Google Translate playback; iOS uses native speech recognition and recording.
export class AudioPractice {
  constructor(onStatus,onError=()=>{}) { this.onStatus = onStatus; this.onError=onError; this.urls = []; this.active = true; }
  fail(message,title,code) { if(!this.active)return; this.onStatus(message); this.onError({title,message,code}); }
  async speak(text, rate = .85, onEnd = () => {}) {
    if (this.recognition || this.recorder?.state === 'recording') { this.onStatus('Hãy dừng micro trước khi nghe mẫu.'); return; }
    this.stopSpeech();
    const controller=new AbortController();this.speechController=controller;
    const stopped=()=>controller.signal.aborted||!this.active;
    try {
      this.onStatus('Đang tải giọng Google Translate…');
      for(const part of splitSpeech(text)) {
        const blob=await googleClip(part,controller.signal);if(stopped())return;
        const url=URL.createObjectURL(blob), player=new Audio(url);this.player=player;this.playerUrl=url;
        player.playbackRate=rate;player.preservesPitch=true;
        await new Promise((resolve,reject)=>{
          this.finishPlayback=resolve;player.onended=resolve;player.onerror=()=>reject(new Error('Chưa phát được âm thanh Google Translate. Hãy thử lại.'));
          this.onStatus('Đang phát giọng Google Translate · Tiếng Nga…');
          player.play().catch(reject);
        });
        URL.revokeObjectURL(url);this.playerUrl=null;if(stopped())return;
      }
      this.onStatus('Đã phát xong. Bạn có thể nghe lại không giới hạn.');onEnd();
    } catch(error) {
      if(!stopped()){const message=error.name==='NotAllowedError'?'Chạm Nghe thêm một lần để cho phép phát âm thanh.':/fetch|network/i.test(error.message||'')?'Chưa kết nối được Google Translate. Kiểm tra Internet rồi thử lại.':error.message||'Chưa phát được giọng Google Translate. Hãy thử lại.';this.fail(message,'Chưa mở được giọng Google Translate','voice');onEnd();}
    } finally { if(this.speechController===controller){this.player=null;this.finishPlayback=null;if(this.playerUrl)URL.revokeObjectURL(this.playerUrl);this.playerUrl=null;} }
  }
  stopSpeech() { this.speechController?.abort();this.player?.pause();this.finishPlayback?.();if(this.playerUrl)URL.revokeObjectURL(this.playerUrl);this.playerUrl=null;this.player=null; }
  recognize(onText, onEnd) {
    if(runtime()?.recognize) {
      if(this.recorder?.state==='recording'){this.onStatus('Hãy dừng ghi âm trước.');return false;}
      this.stopSpeech();let final='';
      const session=runtime().recognize(text=>{final=text;if(this.active)onText(text,'');},()=>{this.recognition=null;if(this.active)onEnd(final);},error=>this.fail(error,'Chưa nhận được giọng nói','microphone'));
      this.recognition=session;this.onStatus('Đang nghe tiếng Nga… Chạm Dừng khi đọc xong.');return true;
    }
    if (!window.isSecureContext) { this.fail('Micro cần kết nối HTTPS trên iPad. Địa chỉ HTTP trong mạng nội bộ chưa mở được micro.','Micro chưa sẵn sàng','microphone'); return false; }
    if (this.recorder?.state === 'recording') { this.onStatus('Hãy dừng ghi âm trước.'); return false; }
    const Recognition = runtime()?.platform==='windows' ? null : window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) { this.fail('Trình duyệt này chưa có nhận giọng trực tiếp. Bạn có thể dùng nút Ghi âm để nghe lại giọng của mình.','Thử một cách luyện nói khác nhé','microphone'); return false; }
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
    const errors = { 'not-allowed':'Chưa được cấp quyền micro/nhận giọng. Kiểm tra quyền của Safari và Siri/Đọc chính tả.', 'audio-capture':'Không tìm thấy micro khả dụng.', 'no-speech':'Chưa nghe thấy tiếng nói. Hãy thử lại.', 'network':'Nhận giọng cần mạng. Kiểm tra kết nối.', 'language-not-supported':'Thiết bị chưa hỗ trợ nhận giọng tiếng Nga.' };
    recognition.onerror = event => { if (this.active && event.error!=='aborted') this.fail(errors[event.error] || 'Nhận giọng bị gián đoạn. Hãy thử ghi âm.','Chưa nhận được giọng nói','microphone'); };
    let finished = false;
    const finish = () => { if (finished) return; finished = true; clearTimeout(this.recognitionTimer); clearTimeout(this.abortTimer); this.recognition = null; if (this.active) onEnd(final.trim()); };
    recognition.onend = finish;
    try {
      recognition.start(); this.onStatus('Đang nghe tiếng Nga… Chạm Dừng khi đọc xong.');
      this.recognitionTimer = setTimeout(() => { recognition.abort(); finish(); if (this.active) this.onStatus('Đã dừng sau 20 giây. Nếu Safari không trả kết quả, dùng chế độ Ghi âm.'); }, 20000);
      this.finishRecognition = finish;
      return true;
    } catch { this.recognition = null; this.fail('Safari chưa mở được nhận giọng. Hãy dùng chế độ Ghi âm hoặc mở lại tab.','Chưa mở được nhận giọng','microphone'); return false; }
  }
  stopRecognition() { if (!this.recognition) return; this.recognition.stop(); this.abortTimer = setTimeout(() => { this.recognition?.abort(); this.finishRecognition?.(); },1500); }
  async record(onDone, onStop) {
    if(runtime()?.record) {
      if(this.recognition){this.onStatus('Hãy dừng nhận giọng trước.');return false;}
      this.stopSpeech();
      try {
        const recorder=await runtime().record(blob=>{clearTimeout(this.recordTimer);if(this.active&&blob.size){const url=URL.createObjectURL(blob);this.urls.push(url);onDone(blob,url);this.onStatus('Đã ghi âm trên thiết bị.');}if(this.active)onStop();});
        this.recorder=recorder;if(!this.active){recorder.stop();return false;}
        this.recordTimer=setTimeout(()=>this.stopRecord(),30000);this.onStatus('Đang ghi âm… Tối đa 30 giây.');return true;
      }catch(error){this.fail(error.message||'Chưa mở được micro. Kiểm tra quyền trong Cài đặt.','Cho phép micro để luyện nói nhé','microphone');return false;}
    }
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) { this.fail('Ghi âm cần kết nối HTTPS và quyền sử dụng micro. localhost chỉ hoạt động trên chính máy đang chạy app.','Micro chưa sẵn sàng','microphone'); return false; }
    if (!window.MediaRecorder) { this.fail('Thiết bị chưa hỗ trợ ghi âm trên trình duyệt. Hãy thử Safari mới hơn.','Chưa ghi âm được trên thiết bị này','microphone'); return false; }
    if (this.recognition) { this.onStatus('Hãy dừng nhận giọng trước.'); return false; }
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
        if (this.active && blob.size) { const url = URL.createObjectURL(blob); this.urls.push(url); onDone(blob, url); this.onStatus('Đã ghi âm. Bản ghi ở trên thiết bị cho đến khi bạn chọn gửi online.'); }
        if (this.active) onStop();
      };
      recorder.onerror = () => { this.stopRecord(); this.fail('Bản ghi chưa hoàn thành. Hãy kiểm tra micro và thử ghi lại.','Ghi âm bị gián đoạn','microphone'); };
      recorder.start(); this.onStatus('Đang ghi âm… Tối đa 30 giây.');
      this.recordTimer = setTimeout(() => this.stopRecord(), 30000);
      return true;
    } catch { this.stream?.getTracks().forEach(t => t.stop()); this.fail('Chưa mở được micro. Hãy kiểm tra quyền micro của website trong Safari rồi thử lại.','Cho phép micro để luyện nói nhé','microphone'); return false; }
  }
  stopRecord() { if (this.recorder?.state === 'recording') this.recorder.stop(); }
  dispose() {
    this.active = false; clearTimeout(this.recordTimer); clearTimeout(this.recognitionTimer); clearTimeout(this.abortTimer);
    this.recognition?.abort(); this.stopRecord(); this.stream?.getTracks().forEach(t => t.stop()); this.stopSpeech();
    this.urls.forEach(url => URL.revokeObjectURL(url));
  }
}
