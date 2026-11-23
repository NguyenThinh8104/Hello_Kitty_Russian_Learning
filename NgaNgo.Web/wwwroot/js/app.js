import { apiFetch, runtime, isInstalled } from './platform.js';
import { lessons, course, alphabet } from './content.js';
import { isCorrect, normalize, speechComparison, wordCount, validateBackup } from './practice.js';
import { AudioPractice } from './audio.js';
import { bookAudio } from './book-audio.js';
import { getExercises, getExercise, draftKey, setResult, recordResult, practicedSets } from './sessions.js';
import { openDialog, closeDialog, initializeDialogs } from './dialogs.js';

const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));
const paths = {
 home:'M3 10 12 3l9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z',
 book:'M12 5v16m0-16C8 2 4 3 2 4v15c4-2 7-1 10 2 3-3 6-4 10-2V4c-2-1-6-2-10 1z',
 cards:'m8 3 13 3-3 15-13-3zM3 6 1 18l3 1',
 chart:'M4 20V4m0 16h17M8 16v-5m5 5V7m5 9v-8',
 letters:'m3 19 6-14 6 14M5 14h8m4 5 4-9m-4 0 4 9',
 headphones:'M3 13v-2a9 9 0 0 1 18 0v2M3 12h3v9H3zM18 12h3v9h-3z',
 mic:'M9 5a3 3 0 0 1 6 0v7a3 3 0 0 1-6 0zM5 10v2a7 7 0 0 0 14 0v-2M12 19v3m-4 0h8',
 pen:'m4 16-1 5 5-1L21 7l-4-4zM14 6l4 4',
 play:'m9 5 11 7-11 7z', stop:'M6 6h12v12H6z',
 volume:'M11 4 5 9H2v6h3l6 5zM15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14',
 check:'m5 12 4 4L20 5', clock:'M12 8v5l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
 flame:'M12 2c0 7-7 7-7 13a7 7 0 0 0 14 0c0-3-2-5-3-6 0 3-2 4-3 4 1-4 0-7-1-11z',
 download:'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5',
 heart:'M20 5c-3-3-7-1-8 1-1-2-5-4-8-1-5 5 4 12 8 15 4-3 13-10 8-15z'
};
const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name] || paths.book}"/></svg>`;
const skillNames = { listening:'Nghe', speaking:'Nói', reading:'Đọc', writing:'Viết' };
const skillIcons = { listening:'headphones', speaking:'mic', reading:'book', writing:'pen' };
const storageKey = 'nga-ngo-a1-v1';
const defaults = () => ({ version:1, progress:{}, drafts:{}, setResults:{}, activity:[], settings:{ rate:.85, foldYo:false } });
let state = defaults(), route, audio, controller, phraseIndex = 0, recordingBlob, toastTimer, caps = { transcription:false };
let localIssue = '', pendingBackup = null;
try { const saved = JSON.parse(localStorage.getItem(storageKey) || 'null'); if (saved && validateBackup(saved, lessons.map(l => l.id))) state = saved; else if (saved) localIssue = 'Dữ liệu cũ chưa tương thích. Hãy nhập lại bản sao lưu hợp lệ.'; } catch { localIssue = 'Trình duyệt chặn lưu dữ liệu hoặc dữ liệu cũ bị lỗi. Hãy xuất bản sao lưu trước khi đóng app.'; }
function save() { try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch { toast('Không lưu được trên thiết bị. Hãy xuất bản sao lưu trong Cài đặt.','error'); } }
function toast(message,tone='info') {
  const node=$('#toast'); node.dataset.tone=tone; node.hidden=false;
  node.innerHTML=`<div class="toast-card"><span class="toast-symbol">${icon(tone==='success'?'check':tone==='error'?'stop':'book')}</span><div class="toast-copy"><strong>${tone==='success'?'Đã cập nhật':tone==='error'?'Chưa thực hiện được':'Một chút lưu ý'}</strong><p>${esc(message)}</p></div><button class="toast-dismiss" data-action="dismiss-toast" aria-label="Đóng thông báo">×</button></div>`;
  clearTimeout(toastTimer); toastTimer=setTimeout(()=>{node.hidden=true;},8000);
}
function localDate(date = new Date()) { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`; }
function recordProgress(id,skill,score,bank=route.bank||'core') {
  recordResult(state,id,skill,bank,score,localDate()); save();
  const toolbar=$('.exercise-toolbar');
  if(toolbar&&route.lesson?.id===id&&route.skill===skill)toolbar.outerHTML=exerciseToolbar(route.lesson,skill);
}
function practiced(id) { return Object.keys(skillNames).filter(skill => state.progress[`${id}:${skill}`]).length; }
function streak() { const days = new Set([...(state.activity || []),...Object.values(state.progress).map(p => p.date)]); let count = 0, date = new Date(); if (!days.has(localDate(date))) date.setDate(date.getDate()-1); while (days.has(localDate(date))) { count++; date.setDate(date.getDate()-1); } return count; }
function nextLesson() { return lessons.find(l => practiced(l.id) < 4) || lessons[0]; }
function heading(eyebrow, title, subtitle = '') { return `<div class="page-heading"><div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p class="page-subtitle">${subtitle}</p></div><span class="date-pill">${esc(new Intl.DateTimeFormat('vi-VN', { weekday:'long', day:'numeric', month:'long' }).format(new Date()))}</span></div>`; }
function bookStrip() { return `<div class="book-strip"><span class="book-cover" lang="ru">Я♥</span><div><strong lang="ru">${esc(course.title)}</strong><p>I Love Russian for Beginners · ${esc(course.edition)} · Bài luyện bổ trợ theo chủ đề</p></div></div>`; }
function card(lesson, i) { const count = practiced(lesson.id); return `<a class="lesson-card" href="#lesson/${lesson.id}/listening"><div class="card-top"><span class="lesson-symbol ${lesson.color}" lang="ru">${esc(lesson.symbol)}</span><span class="card-number">BÀI ${String(lesson.number || i+1).padStart(2,'0')}</span></div><h3 lang="ru">${esc(lesson.title)}</h3><p>${esc(lesson.subtitle)}<br><span class="helper">18 câu nghe/đọc · 6 câu nói · 3 đề viết</span></p><div class="card-meta"><span>Nghe · Nói · Đọc · Viết</span><span>${count}/4 đã luyện</span></div><progress max="4" value="${count}" aria-label="${count} trên 4 kỹ năng đã luyện"></progress></a>`; }
function stats() { const complete = lessons.filter(l => practiced(l.id) === 4).length; return `<div class="stats"><div class="stat"><div class="stat-icon">${icon('flame')}</div><div><strong>${streak()} ngày</strong><span>Chuỗi ngày luyện tập</span></div></div><div class="stat"><div class="stat-icon">${icon('book')}</div><div><strong>${complete}/${lessons.length} bài</strong><span>Đã luyện đủ 4 kỹ năng</span></div></div><div class="stat"><div class="stat-icon">${icon('check')}</div><div><strong>${Object.keys(state.progress).length} lượt</strong><span>Bài × kỹ năng đã luyện</span></div></div></div>`; }
function home() {
  const next = nextLesson();
  return `${heading('ПРИВЕТ! · CHÀO BẠN', 'Một chút tiếng Nga mỗi ngày.', 'Bắt đầu từ những câu đầu tiên. Tự tin hơn qua từng bài học.')}
  <section class="hero"><div class="hero-copy"><div class="eyebrow">HÀNH TRÌNH A1 CỦA BẠN</div><h2 lang="ru">Каждый день —<br>по-русски.</h2><p>Mỗi bài có nhiều bộ luyện: nghe thật kỹ, nói thành lời, đọc để hiểu và viết điều bạn muốn kể.</p><a class="btn coral" href="#lesson/${next.id}/listening">${icon('play')} ${practiced(next.id) ? 'Tiếp tục bài học' : 'Bắt đầu học'}</a></div><div class="hero-art" aria-hidden="true"><div class="letter-card" lang="ru">Аа<span>НАЧИНАЕМ</span></div><div class="letter-card second" lang="ru">Я<span>ЛЮБЛЮ РУССКИЙ</span></div><span class="orbit-letter">Привет!</span></div></section>
  ${stats()}<div class="section-heading"><h2>Bài học dành cho bạn</h2><a class="text-link" href="#lessons">Xem lộ trình</a></div><div class="lesson-grid">${lessons.slice(0,6).map(card).join('')}</div><div class="note"><strong>Đồng hành cùng giáo trình 2017.</strong> ${esc(course.notice)}</div>`;
}
function lessonList() { return `${heading('ВАШ ПУТЬ · LỘ TRÌNH', 'Từ «Привет!» đến câu chuyện của bạn.', '14 bài · 252 câu nghe/đọc · 84 câu nói · 42 đề viết. Mỗi bài có 3 bộ nghe, 3 bộ đọc và 3 đề viết để học lại với tình huống mới.')}${bookStrip()}<div class="lesson-grid">${lessons.map(card).join('')}</div><div class="note">${esc(course.notice)}</div>`; }
function lessonView(lesson, skill) {
  return `<div class="breadcrumb"><a href="#lessons">Lộ trình học</a><span>/</span><span>Bài ${lesson.number || lessons.indexOf(lesson)+1}</span></div><div class="lesson-heading"><span class="lesson-symbol ${lesson.color}" lang="ru">${esc(lesson.symbol)}</span><div><h1 lang="ru">${esc(lesson.title)}</h1><p>${esc(lesson.goal)}</p></div></div><p class="lesson-source">${lesson.pages ? `Giáo trình 2017 · trang in ${esc(lesson.pages)} · ` : ''}Bài tập bổ trợ tự biên soạn · Audio tổng hợp, không phải audio gốc của sách</p>
  <nav class="tabs" aria-label="Kỹ năng">${Object.entries(skillNames).map(([key,label]) => `<a class="tab ${key === skill ? 'active' : ''}" href="#lesson/${lesson.id}/${key}" ${key === skill ? 'aria-current="page"' : ''}>${icon(skillIcons[key])}${label}${state.progress[`${lesson.id}:${key}`] ? '<small>✓</small>' : ''}</a>`).join('')}</nav>
  ${skill !== 'speaking' ? exerciseToolbar(lesson,skill) : ''}
  ${skill === 'listening' || skill === 'reading' ? comprehension(lesson, skill) : skill === 'speaking' ? speaking(lesson) : writing(lesson)}
  ${skill !== 'speaking' ? sessionNavigation(lesson,skill) : ''}<div class="note"><strong>Góc ngữ pháp.</strong> ${esc(lesson.grammar)}</div>`;
}
function speedSelect() { return `<select id="speed" aria-label="Tốc độ phát">${[.65,.85,1].map(rate => `<option value="${rate}" ${state.settings.rate === rate ? 'selected' : ''}>${rate === .65 ? 'Chậm' : rate === .85 ? 'Vừa' : 'Tự nhiên'} · ${rate}×</option>`).join('')}</select>`; }
function bankUrl(lesson,skill,bank='core'){return `#lesson/${lesson.id}/${skill}${skill==='speaking'?'':`/${bank}`}`;}
function exerciseToolbar(lesson,skill){
  const sets=getExercises(lesson,skill), task=getExercise(lesson,skill,route.bank), index=sets.indexOf(task), result=setResult(state,lesson.id,skill,task.id);
  return `<section class="exercise-toolbar" aria-label="Bộ luyện hiện tại"><div><div class="eyebrow">${esc(skillNames[skill])} · ${esc(task.label)}</div><h2 lang="ru">${esc(task.title)}</h2><p>${esc(task.focus||(skill==='writing'?task.guide:'Luyện nghe/đọc hiểu và dùng đúng dạng từ.'))}</p><div class="set-summary" aria-label="${practicedSets(state,lesson,skill)} trên ${sets.length} bộ đã luyện">${sets.map(s=>`<span class="set-dot ${setResult(state,lesson.id,skill,s.id)?'done':''} ${s.id===task.id?'current':''}" aria-hidden="true"></span>`).join('')}</div></div><div class="set-controls"><span class="set-count">Bộ ${index+1} / ${sets.length}${result?' · Đã luyện':''}</span><button class="btn secondary small" data-action="choose-set">Đổi bộ luyện</button></div></section>`;
}
function nextSetUrl(lesson,skill){
  const sets=getExercises(lesson,skill),index=sets.findIndex(s=>s.id===route.bank);
  if(index<sets.length-1)return bankUrl(lesson,skill,sets[index+1].id);
  if(skill==='listening')return bankUrl(lesson,'speaking');
  if(skill==='reading')return bankUrl(lesson,'writing');
  const next=lessons[lessons.indexOf(lesson)+1];
  return next?bankUrl(next,'listening'):'#progress';
}
function sessionNavigation(lesson,skill){
  const sets=getExercises(lesson,skill),index=sets.findIndex(s=>s.id===route.bank),last=index===sets.length-1;
  return `<nav class="set-navigation" aria-label="Điều hướng bộ luyện">${index?`<a class="btn secondary" href="${bankUrl(lesson,skill,sets[index-1].id)}">Bộ trước</a>`:'<span class="helper">Bộ đầu tiên</span>'}<a class="btn soft" href="${nextSetUrl(lesson,skill)}">${last?skill==='listening'?'Chuyển sang luyện nói':skill==='reading'?'Chuyển sang luyện viết':'Tiếp tục lộ trình':'Bộ luyện tiếp theo'}</a></nav>`;
}
function showSetPicker(){
  const {lesson,skill,bank}=route;
  openDialog({title:`Chọn bộ luyện ${skillNames[skill].toLowerCase()}`,subtitle:`Bài ${lesson.number} · ${lesson.title} · Trang ${lesson.pages}. Bản nháp và kết quả được lưu riêng cho mỗi bộ.`,wide:true,
    body:`<div class="set-grid">${getExercises(lesson,skill).map((task,index)=>{const result=setResult(state,lesson.id,skill,task.id);return `<button class="set-option ${bank===task.id?'selected':''}" data-action="select-set" data-bank="${task.id}" aria-label="Chọn bộ ${index+1}: ${esc(task.title)}" ${bank===task.id?'aria-current="true"':''}><span class="set-number">${String(index+1).padStart(2,'0')}</span><small>${esc(task.label)}</small><strong lang="ru">${esc(task.title)}</strong><small>${esc(task.focus||(skill==='writing'?`${task.min}–${task.max} từ`:`${task.questions.length} câu hỏi gõ đáp án`))}</small><span class="set-state">${result?skill==='writing'?'Đã kiểm tra online':`Kết quả tốt nhất: ${result.best}%`:bank===task.id?'Đang mở':'Sẵn sàng luyện tập'}</span></button>`;}).join('')}</div>`,
    footer:'<button class="btn secondary" data-action="close-dialog">Quay lại bài đang học</button>'});
}
function showPracticeError({title,message,code}){
  const voice=code==='voice';
  openDialog({title,subtitle:'Bài đang học vẫn được giữ. Bạn có thể quay lại bất cứ lúc nào.',variant:'error',
    body:`<div class="error-illustration" aria-hidden="true">${icon(voice?'headphones':'mic')}</div><p class="error-message">${esc(message)}</p><div class="error-help">${voice?'Giọng mẫu được lấy từ Google Translate và cần Internet lần đầu. Chạm Nghe để thử lại; bạn cũng có thể nghe audio gốc của sách.':'Cho phép Russian Kitty dùng Micro và Nhận dạng giọng nói trong Cài đặt thiết bị. Nếu nhận giọng chưa chạy, hãy thử Ghi âm để tự nghe lại.'}</div>`,
    footer:'<button class="btn secondary" data-action="close-dialog">Quay lại bài học</button><button class="btn coral" data-action="open-settings">Xem hướng dẫn</button>'});
}
function showWritingError(message){
  openDialog({title:'Chưa kiểm tra bài viết được',subtitle:'Bản nháp của bạn vẫn được giữ trên thiết bị.',variant:'error',
    body:`<div class="error-illustration" aria-hidden="true">${icon('pen')}</div><p class="error-message">${esc(message)}</p><div class="error-help">Kiểm tra kết nối mạng. Nếu dịch vụ đang bận hoặc giới hạn lượt kiểm tra, hãy đợi một lúc rồi thử lại. Bạn có thể tiếp tục viết ngay.</div>`,
    footer:'<button class="btn secondary" data-action="close-dialog">Tiếp tục viết</button><button class="btn coral" data-action="retry-writing">Thử kiểm tra lại</button>'});
}
function progressCell(lesson,skill){
  const result=state.progress[`${lesson.id}:${skill}`];
  if(skill==='speaking')return result?`${result.best}%<small>Mức khớp từ tốt nhất</small>`:'Chưa luyện';
  const count=practicedSets(state,lesson,skill),total=getExercises(lesson,skill).length;
  return count?`${count}/${total} bộ<small>${skill==='writing'?'Đã nhận phản hồi online':'Đã kiểm tra đáp án'}</small>`:'Chưa luyện';
}
function originalAudio(lesson) {
  const tracks = bookAudio[lesson.number] || [];
  return `<details class="original-audio"><summary>Nghe thêm audio gốc của sách · Module 1</summary><p class="helper">Audio do Liden & Denz cung cấp. Dùng cùng bài tập trong PDF trang ${esc(lesson.pages)}. Bộ câu hỏi gõ đáp án trong app áp dụng cho đoạn bổ trợ phía trên.</p>${tracks.length ? `<label for="book-track" class="helper">Chọn audio theo số bài tập trong sách</label><select id="book-track">${tracks.map(t => `<option value="${esc(t.url)}">${esc(t.label)}</option>`).join('')}</select><audio id="book-audio" controls playsinline preload="none" src="${esc(tracks[0].url)}"></audio><label class="check-row"><input type="checkbox" id="book-loop">Lặp lại audio này</label><p id="book-audio-status" class="helper" role="status">Cần Internet để phát audio gốc.</p>` : '<p class="helper">Chưa có tệp Module 1 được xác minh cho bài này. Mở trang nguồn để xem tài liệu hiện có.</p>'}<a class="text-link" href="${esc(lesson.bookAudio)}" target="_blank" rel="noopener">Mở trang audio Liden & Denz</a></details>`;
}
function comprehension(lesson, skill) {
  const exercise = getExercise(lesson,skill,route.bank), listening = skill === 'listening';
  const left = listening ? `<section class="panel audio-panel" id="player"><div class="eyebrow">СЛУШАЕМ · NGHE ĐỂ HIỂU</div><div class="audio-emblem">${icon('headphones')}</div><h2 lang="ru">${esc(exercise.title)}</h2><p>Nghe bao nhiêu lần tùy bạn.<br>Điền câu trả lời ở bên cạnh.</p><div class="wave" aria-hidden="true">${'<i></i>'.repeat(23)}</div><div class="player-actions"><button class="btn" data-action="listen">${icon('play')} Nghe đoạn văn</button><button class="btn secondary" data-action="stop-audio" aria-label="Dừng phát">${icon('stop')}</button></div><div class="speed-row"><span>Tốc độ</span>${speedSelect()}</div><p class="status-text" id="audio-status" role="status">Giọng Google Translate · Tiếng Nga.</p><details class="transcript"><summary>Xem lời thoại sau khi nghe</summary><p lang="ru" class="russian-text">${esc(exercise.text)}</p></details></section>` : `<section class="panel"><div class="eyebrow">ЧИТАЕМ · ĐỌC VÀ KHÁM PHÁ</div><h2 lang="ru">${esc(exercise.title)}</h2><p class="russian-text" lang="ru">${esc(exercise.text)}</p><button class="btn soft small" data-action="listen">${icon('volume')} Nghe đoạn đọc</button><p id="audio-status" class="status-text" role="status"></p><p class="helper">Dựa vào đoạn văn để điền từ còn thiếu. Giữ đúng đuôi từ theo ngữ cảnh.</p></section>`;
  return `<div class="exercise-grid"><div>${left}${listening ? originalAudio(lesson) : ''}</div><section class="panel"><div class="eyebrow">${listening ? 'BẠN ĐÃ NGHE ĐƯỢC GÌ?' : 'BẠN ĐÃ ĐỌC HIỂU CHƯA?'}</div><h2>Điền câu trả lời</h2><p class="helper">Gõ bằng chữ Cyrillic. ${state.settings.foldYo ? 'Chấp nhận е thay ё.' : 'Phân biệt е và ё.'} Không phân biệt hoa/thường và dấu trọng âm.</p><form id="answer-form">${exercise.questions.map((q,i) => `<div class="question"><div class="question-header">CÂU ${i+1} / ${exercise.questions.length}</div><label lang="ru" for="answer-${i}">${esc(q.prompt)}</label><input id="answer-${i}" name="answer-${i}" lang="ru" autocomplete="off" autocapitalize="off" spellcheck="false" maxlength="200" aria-required="true" value="${esc(state.drafts[draftKey(lesson.id,skill,route.bank,i)] || '')}"><div id="feedback-${i}" aria-live="polite"></div><details class="hint"><summary>Gợi ý</summary>${esc(q.hint)}</details></div>`).join('')}<div class="form-actions"><button class="btn coral" type="submit">${icon('check')} Kiểm tra câu trả lời</button><button class="text-link" type="button" data-action="retry">Làm lại</button></div></form><div id="exercise-result" aria-live="polite"></div><p class="kbd-note">iPad: Cài đặt > Cài đặt chung > Bàn phím > Thêm bàn phím > Tiếng Nga.</p></section></div>`;
}
function speaking(lesson) {
  const phrase = lesson.speaking[phraseIndex];
  return `<div class="exercise-grid"><section class="panel"><div class="eyebrow">ГОВОРИМ · NÓI THÀNH LỜI</div><div class="speaking-list" aria-label="Chọn câu luyện nói">${lesson.speaking.map((p,i) => `<button class="phrase-step ${i === phraseIndex ? 'active' : ''}" data-action="phrase" data-index="${i}" aria-label="Câu ${i+1}" aria-pressed="${i === phraseIndex}">${i+1}</button>`).join('')}</div><h2>Nghe mẫu, rồi đọc lại</h2><p class="speaking-phrase" lang="ru">${esc(phrase.text)}</p><p class="muted">${esc(phrase.translation)}</p><button class="btn soft" data-action="listen">${icon('volume')} Nghe mẫu</button><div class="grammar"><h3>Chú ý phát âm</h3><p>${esc(phrase.tip)}</p></div><div class="recording-box"><h3>Ghi âm để tự nghe lại</h3><p class="helper">Ghi âm tối đa 30 giây. Bản ghi không tự động tải lên mạng.</p><button class="btn secondary" id="record-button" data-action="record">${icon('mic')} Ghi âm</button><div id="recording-preview"></div><div id="online-transcription" hidden><label class="consent"><input type="checkbox" id="speech-consent"><span>Tôi đồng ý gửi bản ghi đến OpenAI để chuyển thành chữ. Dịch vụ có thể phát sinh phí cho chủ máy chủ. <a href="https://openai.com/policies/privacy-policy/" target="_blank" rel="noopener">Quyền riêng tư</a>.</span></label><button class="btn soft small" id="transcribe-button" data-action="transcribe">Nhận giọng từ bản ghi</button></div><p class="helper" id="server-speech-note">Đang kiểm tra nhận giọng online…</p></div></section><section class="panel center"><div class="eyebrow">BẠN NÓI · ỨNG DỤNG LẮNG NGHE</div><h2>Thử nói tiếng Nga</h2><p class="helper">Chạm micro và đọc câu mẫu.<br>Cho phép ứng dụng sử dụng micro khi được hỏi.</p><button class="mic-button" id="recognize-button" data-action="recognize" aria-label="Bắt đầu nhận giọng">${icon('mic')}</button><p id="mic-label" class="helper">Chạm để bắt đầu</p><p id="audio-status" role="status" class="status-text"></p><div class="speaking-result" id="speech-text" lang="ru">Câu bạn nói sẽ xuất hiện ở đây.</div><div id="speech-score" aria-live="polite"></div><p class="helper">Chỉ so sánh từ trong bản nhận dạng với câu mẫu. Đây không phải điểm phát âm, trọng âm hay ngữ điệu.</p><p class="helper">Bản iPad dùng nhận giọng của Apple; âm thanh có thể được Apple xử lý qua mạng. Bản Windows hỗ trợ ghi âm để tự nghe lại. Nếu không hoạt động, hãy dùng Ghi âm.</p></section></div>`;
}
function writing(lesson) {
  const w = getExercise(lesson,'writing',route.bank), text = state.drafts[draftKey(lesson.id,'writing',route.bank)] || '';
  return `<div class="exercise-grid"><section class="panel"><div class="eyebrow">ПИШЕМ · VIẾT ĐIỀU BẠN MUỐN KỂ</div><h2 lang="ru">${esc(w.title)}</h2><p class="writing-prompt" lang="ru">${esc(w.prompt)}</p><p class="helper">${esc(w.guide)} Mục tiêu ${w.min}–${w.max} từ.</p><div class="subtle-rule"></div><h3>Một vài cách bắt đầu</h3>${w.starters.map(s => `<span class="starter" lang="ru">${esc(s)}</span>`).join('')}<details class="sample"><summary>Xem bài mẫu tham khảo</summary><p lang="ru" class="russian-text">${esc(w.sample)}</p></details><p class="helper">Hãy viết câu chuyện của bạn; bài mẫu chỉ gợi ý cách diễn đạt.</p></section><section class="panel"><h2><label for="writing-text">Bài viết của bạn</label></h2><textarea id="writing-text" lang="ru" rows="10" maxlength="5000" placeholder="Начните здесь…" spellcheck="false">${esc(text)}</textarea><div class="writing-meta"><span id="word-count">${wordCount(text)} / ${w.min}–${w.max} từ</span><span id="draft-status">Lưu bản nháp trên thiết bị</span></div><label class="consent"><input type="checkbox" id="writing-consent"><span>Tôi đồng ý gửi bài viết đến <a href="https://languagetool.org/legal/privacy" target="_blank" rel="noopener">LanguageTool</a> để kiểm tra. Chỉ gửi khi bấm nút bên dưới.</span></label><div class="form-actions"><button class="btn coral" id="writing-check" data-action="writing-check">${icon('check')} Kiểm tra bài viết online</button></div><p class="provider">Kiểm tra chính tả và một số quy tắc ngữ pháp bằng <a href="https://languagetool.org" target="_blank" rel="noopener">LanguageTool</a>. Dịch vụ không đánh giá đầy đủ ý nghĩa, độ tự nhiên hoặc mức độ trả lời đúng đề. Không phát hiện lỗi không đồng nghĩa bài hoàn hảo.</p><div id="writing-result" class="result-region" aria-live="polite"></div></section></div>`;
}
function vocabulary() { return `${heading('СЛОВАРЬ · TỦ TỪ CỦA BẠN', 'Gặp từ mới. Nhớ thêm một chút.', 'Chạm biểu tượng loa để nghe từ. Dấu sắc trên chữ Nga chỉ trọng âm, không phải dấu tiếng Việt.')}<div class="vocab-toolbar"><input id="vocab-search" type="search" placeholder="Tìm từ Nga hoặc nghĩa tiếng Việt…" aria-label="Tìm từ vựng"><select id="vocab-lesson" aria-label="Lọc từ theo bài"><option value="all">Tất cả bài học</option>${lessons.map(l => `<option value="${l.id}">${l.number}. ${esc(l.title)}</option>`).join('')}</select></div><div id="audio-status" class="status-text" role="status"></div><div id="vocab-results"></div>`; }
function renderVocab() { const query = normalize($('#vocab-search').value, true), filter = $('#vocab-lesson').value; const words = lessons.filter(l => filter === 'all' || l.id === filter).flatMap(l => l.vocab.map(([ru,vi]) => ({ ru,vi,lesson:l }))).filter(w => normalize(`${w.ru} ${w.vi}`, true).includes(query)); $('#vocab-results').innerHTML = `<p class="search-count">${words.length} mục từ · Từ trọng tâm được chọn theo chủ đề bài học</p><div class="vocab-grid">${words.map(w => `<article class="vocab-card"><div class="vocab-top"><strong lang="ru">${esc(w.ru)}</strong><button class="icon-button" data-action="word" data-word="${esc(w.ru)}" aria-label="Nghe ${esc(w.ru)}">${icon('volume')}</button></div><p>${esc(w.vi)}</p><small>Bài ${w.lesson.number} · ${esc(w.lesson.title)}</small></article>`).join('')}</div>${words.length ? '' : '<p class="empty-state">Chưa tìm thấy từ. Thử một từ khóa khác.</p>'}`; }
function alphabetView() { return `${heading('АЗБУКА · BƯỚC ĐẦU TIÊN', '33 chữ cái. Một thế giới mới.', 'Chạm vào chữ để nghe tên chữ cái bằng tiếng Nga.')}<div id="audio-status" class="status-text" role="status"></div><div class="alphabet-grid">${alphabet.map(([letter,name]) => `<button class="letter-tile" data-action="word" data-word="${esc(name)}" aria-label="Nghe chữ ${esc(letter)}"><strong lang="ru">${esc(letter)}</strong><span lang="ru">${esc(name)}</span></button>`).join('')}</div><div class="note"><strong>Đọc đúng từ những bước đầu.</strong> Ь và Ъ không biểu thị âm riêng. Е, ё, ю, я có thể làm mềm phụ âm đứng trước. Ё luôn có trọng âm trong từ thông thường. Nghe tên chữ chỉ là bước đầu; hãy kết hợp âm và từ trong bài luyện.</div>`; }
function progressView() { return `${heading('МОЙ ПРОГРЕСС · NHÌN LẠI HÀNH TRÌNH', 'Những bước nhỏ đều đáng kể.', 'Tiến độ và bản nháp được lưu trên thiết bị này. Xuất bản sao lưu để chuyển thiết bị.')}${stats()}<section class="panel table-wrap"><h2>Tiến độ từng bài</h2><p class="helper">Nghe/đọc/viết: số bộ đã luyện trên tổng số bộ. Nói: mức khớp từ tốt nhất, không phải điểm phát âm.</p><table><thead><tr><th>BÀI HỌC</th>${Object.values(skillNames).map(s => `<th>${s.toUpperCase()}</th>`).join('')}</tr></thead><tbody>${lessons.map(l => `<tr><td><a href="#lesson/${l.id}/listening"><strong lang="ru">${l.number}. ${esc(l.title)}</strong></a></td>${Object.keys(skillNames).map(skill => { const result = state.progress[`${l.id}:${skill}`]; return `<td><a class="skill-pill ${result ? 'done' : ''}" href="#lesson/${l.id}/${skill}">${progressCell(l,skill)}</a></td>`; }).join('')}</tr>`).join('')}</tbody></table></section>`; }
function settingsView() { return `${heading('НАСТРОЙКИ · THEO CÁCH CỦA BẠN', 'Russian Kitty của bạn.', 'Giọng Google Translate, ứng dụng cài đặt và hành trình học tiếng Nga.')}<div class="settings-grid"><section class="panel"><h2>Tùy chỉnh luyện tập</h2><div class="field"><label for="speed">Tốc độ đọc mặc định</label>${speedSelect()}</div><label class="check-row"><input type="checkbox" id="fold-yo" ${state.settings.foldYo ? 'checked' : ''}>Chấp nhận е thay ё khi chấm nghe/đọc</label><p class="helper">Mặc định phân biệt е và ё để luyện chính tả chính xác. Phần nói chấp nhận cả hai.</p><div class="subtle-rule"></div><h3>Giọng Google Translate · Русский</h3><p id="voice-status" class="helper"></p><button class="btn soft small" data-action="test-voice">${icon('volume')} Thử giọng đọc</button><p id="audio-status" class="status-text" role="status"></p></section><section class="panel"><h2>${isInstalled()?'Ứng dụng đã sẵn sàng':'Ứng dụng Russian Kitty'}</h2><p class="helper">${isInstalled()?'Bạn đang dùng bản ứng dụng cài đặt. Giao diện và bài học nằm trên thiết bị; không cần mở Safari hay chạy máy chủ.':'Đây là bản xem trước trên trình duyệt. Bản Windows mở bằng Russian Kitty.exe. Bản iPad được cài từ dự án Xcode trên Mac.'}</p><p class="helper">Nghe giọng Google Translate và kiểm tra bài viết cần Internet. Bản iPad dùng micro và nhận giọng của iOS.</p><p class="helper">Thêm bàn phím Nga: Cài đặt > Cài đặt chung > Bàn phím > Thêm bàn phím > Tiếng Nga.</p></section><section class="panel"><h2>Bản nháp & tiến độ</h2><p class="helper">Tiến độ lưu trên thiết bị, chưa đồng bộ tài khoản. Xuất bản sao lưu để chuyển từ trình duyệt sang app hoặc sang thiết bị khác.</p><button class="btn secondary" data-action="export">${icon('download')} Xuất bản sao lưu</button><div class="field"><label for="backup-file">Khôi phục từ file JSON</label><input class="file-input" id="backup-file" type="file" accept=".json,application/json"><p class="helper">Khôi phục sẽ thay thế dữ liệu hiện tại trên thiết bị.</p></div><details><summary class="text-link">Xóa dữ liệu trên thiết bị</summary><p class="helper">Hãy xuất bản sao lưu trước khi xóa.</p><button class="btn danger small" data-action="reset">Xác nhận xóa bản nháp và tiến độ</button></details></section><section class="panel"><h2>Giáo trình & nội dung</h2>${runtime()?.importTextbook?'<div class="field"><label for="textbook-file">Thêm PDF giáo trình từ Files</label><input class="file-input" id="textbook-file" type="file" accept=".pdf,application/pdf"><p class="helper">Tối đa 60 MB. PDF được lưu trong app trên iPad, không tải lên mạng.</p></div>':''}<p class="helper"><strong lang="ru">${esc(course.title)}</strong><br>${esc(course.edition)} · Liden & Denz</p><p class="helper">${esc(course.notice)}</p><p class="helper">Bài nghe gốc của sách được giữ riêng với giọng Google Translate của bài bổ trợ. Phần nói so sánh từ được nhận dạng, chưa chấm ngữ âm. Phần viết cần giảng viên đánh giá thêm nội dung.</p><a class="resource-link" href="https://languagetool.org" target="_blank" rel="noopener">Dịch vụ kiểm tra ngôn ngữ LanguageTool</a><p class="helper" id="capability-status"></p></section></div>`; }
function updateVoiceStatus() { const node=$('#voice-status');if(node)node.textContent='Giọng Nga của Google Translate. Âm thanh cần Internet để tải lần đầu; các đoạn vừa nghe được giữ tạm để nghe lại trong phiên học.'; }
function setAudioStatus(message) { const node = $('#audio-status'); if (node) node.textContent = message; else toast(message); $('#player')?.classList.toggle('playing',message.startsWith('Đang phát')); }
function render(focus = false) {
  audio?.dispose(); controller?.abort(); recordingBlob = null; closeDialog();
  const parts = (location.hash.slice(1) || 'home').split('/');
  route = { page:parts[0], lesson:lessons.find(l => l.id === parts[1]), skill:parts[2], bank:parts[3]||'core' };
  if (route.page === 'lesson' && (!route.lesson || !Object.hasOwn(skillNames, route.skill) || (route.skill!=='speaking'&&!getExercise(route.lesson,route.skill,route.bank)))) { location.hash = 'lessons'; return; }
  const navPage = route.page === 'lesson' ? 'lessons' : route.page;
  $('#navigation').innerHTML = [['home','home','Tổng quan'],['lessons','book','Lộ trình'],['vocabulary','cards','Từ vựng'],['alphabet','letters','Chữ cái'],['progress','chart','Tiến độ']].map(([key,ico,label]) => `<a class="nav-item ${key === navPage ? 'active' : ''}" href="#${key}" aria-label="${label}" ${key === navPage ? 'aria-current="page"' : ''}>${icon(ico)}<span>${label}</span></a>`).join('');
  $('#main').innerHTML = route.page === 'home' ? home() : route.page === 'lessons' ? lessonList() : route.page === 'lesson' ? lessonView(route.lesson, route.skill) : route.page === 'vocabulary' ? vocabulary() : route.page === 'alphabet' ? alphabetView() : route.page === 'progress' ? progressView() : route.page === 'settings' ? settingsView() : `<p class="empty-state">Không tìm thấy trang. <a href="#home">Về tổng quan</a></p>`;
  document.title = `${route.lesson?.title || ({ home:'Tổng quan', lessons:'Lộ trình', vocabulary:'Từ vựng', alphabet:'Chữ cái', progress:'Tiến độ', settings:'Cài đặt' }[route.page] || 'Trang')} · Russian Kitty`;
  audio = new AudioPractice(setAudioStatus,showPracticeError);
  if (route.page === 'vocabulary') renderVocab();
  if (route.page === 'settings') updateVoiceStatus();
  const nativeAudio = $('#book-audio');
  if (nativeAudio) {
    nativeAudio.addEventListener('play', () => { audio.stopSpeech(); audio.stopRecognition(); audio.stopRecord(); });
    nativeAudio.addEventListener('error', () => { $('#book-audio-status').textContent = 'Chưa tải được audio gốc. Kiểm tra mạng hoặc mở trang nguồn Liden & Denz.'; });
  }
  updateCapabilities();
  if (focus) { window.scrollTo(0,0); $('#main').focus({ preventScroll:true }); }
}
function updateCapabilities() {
  const note = $('#server-speech-note');
  if (note) note.textContent = caps.nativeSpeech ? 'Bản iPad dùng nhận giọng của iOS. Cho phép Micro và Nhận dạng giọng nói khi được hỏi.' : caps.transcription ? 'Máy chủ đã bật nhận giọng online. Ghi âm xong để sử dụng.' : 'Bạn có thể ghi âm và tự nghe lại. Bản iPad hỗ trợ nhận giọng tiếng Nga của iOS.';
  const status = $('#capability-status');
  if (status) status.textContent = `PDF giáo trình: ${caps.textbook ? 'sẵn có' : 'chưa có'}. Giọng mẫu: Google Translate. Kiểm tra bài viết: LanguageTool, cần Internet.`;
  const source = $('.lesson-source');
  if (caps.textbook && source && !$('.book-pdf-link')) {
    const link = document.createElement('a'); link.className = 'book-pdf-link'; link.href = `/api/textbook#page=${Number(route.lesson.pages.split('–')[0])+1}`;
    if(isInstalled()){link.href='#';link.addEventListener('click',async event=>{event.preventDefault();try{await runtime().openTextbook();}catch{toast('Chưa mở được PDF. Hãy thử lại.');}});}else link.target = '_blank'; link.rel = 'noopener'; link.textContent = isInstalled()?'Mở PDF giáo trình':'Mở trang sách PDF'; source.append(' · ',link);
  }
}
function handleAnswers(event) {
  event.preventDefault(); const {lesson,skill,bank}=route, exercise=getExercise(lesson,skill,bank);
  const missing=exercise.questions.map((q,i)=>i).filter(i=>!$(`#answer-${i}`).value.trim());
  if(missing.length){toast(`Còn ${missing.length} câu chưa điền. Hãy trả lời trước khi kiểm tra.`);$(`#answer-${missing[0]}`).focus();return;}
  let count=0;
  exercise.questions.forEach((q,i)=>{
    const input=$(`#answer-${i}`), correct=isCorrect(input.value,q.answers,state.settings.foldYo);
    if(correct)count++;input.className=correct?'answer-good':'answer-bad';input.setAttribute('aria-invalid',String(!correct));
    $(`#feedback-${i}`).innerHTML=`<p class="feedback ${correct?'good':'bad'}">${correct?'✓ Chính xác.':`Đáp án: <strong lang="ru">${esc(q.answers.join(' / '))}</strong>.`} ${esc(q.explanation)}</p>`;
  });
  recordProgress(lesson.id,skill,Math.round(count/exercise.questions.length*100));
  const complete=count===exercise.questions.length;
  $('#exercise-result').innerHTML=`<div class="result-card ${complete?'':'review'}"><div class="result-top"><span class="result-symbol">${icon(complete?'check':'book')}</span><strong>${complete?'Отлично! Bạn làm tốt lắm.':'Thêm một lần để nhớ chắc hơn.'}</strong></div><p>Bạn trả lời đúng <strong>${count}/${exercise.questions.length}</strong> câu trong bộ «${esc(exercise.title)}». Kết quả tốt nhất được lưu riêng cho bộ này.</p><div class="form-actions">${complete?'<button class="btn coral small" data-action="next-set">Tiếp tục luyện tập</button>':'<button class="btn coral small" data-action="retry-wrong">Chỉ sửa các câu sai</button>'}<button class="btn secondary small" data-action="choose-set">Chọn bộ khác</button></div></div>`;
}
function showSpeechResult(text, interim = '') { const node = $('#speech-text'); if (!node) return; node.textContent = text || interim || 'Chưa nhận được câu nói.'; if (!text) return; const score = speechComparison(route.lesson.speaking[phraseIndex].text, text); $('#speech-score').innerHTML = `<div class="score">${score}%</div><p class="helper">Mức khớp từ với câu mẫu · ${score === 100 ? 'Đã khớp toàn bộ từ.' : 'So sánh câu mẫu với bản nhận dạng và thử lại.'}</p>`; recordProgress(route.lesson.id, 'speaking', score); }
async function checkWriting() {
  const text = $('#writing-text').value, consent = $('#writing-consent').checked;
  if (!text.trim()) { toast('Hãy viết vài câu trước khi kiểm tra.'); return; }
  if (!/[А-Яа-яЁё]/.test(text)) { toast('Hãy viết bài bằng tiếng Nga (chữ Cyrillic).'); return; }
  if (!consent) { toast('Hãy chọn đồng ý gửi bài viết đến LanguageTool.'); return; }
  const button = $('#writing-check'); button.disabled = true; button.textContent = 'Đang kiểm tra…';
  const result = $('#writing-result'); result.textContent = 'Đang kết nối LanguageTool…';
  controller?.abort(); controller = new AbortController(); const currentController = controller, lesson = route.lesson, bank=route.bank, task = getExercise(lesson,'writing',bank);
  try {
    const response = await apiFetch('/api/writing/check', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({text,consent}), signal:currentController.signal });
    const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Chưa kiểm tra được bài viết.');
    if(controller!==currentController||route.lesson?.id!==lesson.id||route.skill!=='writing'||route.bank!==bank)return;
    if ($('#writing-text')?.value !== text) { result.textContent = 'Bài viết đã thay đổi trong khi kiểm tra. Hãy kiểm tra lại bản mới nhất.'; return; }
    const matches = data.matches || [];
    if (wordCount(text) >= task.min) recordProgress(lesson.id, 'writing', 0,bank);
    result.innerHTML = `<div class="result-banner">${matches.length ? `Tìm thấy ${matches.length} điểm cần xem lại.` : 'LanguageTool chưa phát hiện lỗi.'} ${wordCount(text) < task.min ? `Hãy viết thêm để đạt tối thiểu ${task.min} từ và ghi nhận lượt luyện.` : 'Đã lưu lượt kiểm tra.'} Chưa đánh giá nội dung và độ tự nhiên.</div>${matches.map((m,i) => `<article class="correction"><p><mark lang="ru">${esc(text.slice(m.offset,m.offset+m.length) || '(vị trí chèn)')}</mark> · ${esc(m.message)}</p>${m.replacements.map(replacement => `<button class="btn secondary small" data-action="replace" data-offset="${m.offset}" data-length="${m.length}" data-replacement="${esc(replacement)}" lang="ru">${esc(replacement)}</button>`).join('')}</article>`).join('')}`;
    result.dataset.snapshot = text;
  } catch (error) { if (error.name !== 'AbortError'&&controller===currentController&&route.lesson?.id===lesson.id&&route.bank===bank) { const message=error.message==='Failed to fetch'?'Không kết nối được máy chủ. Hãy kiểm tra mạng rồi thử lại.':error instanceof SyntaxError?'Máy chủ chưa trả về kết quả hợp lệ. Hãy thử lại sau.':error.message; result.innerHTML = `<p class="online-error">${esc(message)}</p>`; showWritingError(message); } }
  finally { if (button.isConnected) { button.disabled = false; button.innerHTML = `${icon('check')} Kiểm tra bài viết online`; } }
}
async function transcribe() {
  if (!recordingBlob) return;
  if (!$('#speech-consent').checked) { toast('Hãy đồng ý gửi bản ghi trước khi nhận giọng online.'); return; }
  const blob = recordingBlob, button = $('#transcribe-button'); button.disabled = true;
  const data = new FormData(); data.append('audio', blob, blob.type.includes('webm') ? 'recording.webm' : 'recording.mp4'); data.append('consent','true');
  controller?.abort(); controller = new AbortController(); const currentController = controller;
  setAudioStatus('Đang chuyển bản ghi thành chữ…');
  try { const response = await apiFetch('/api/speech/transcribe', { method:'POST', body:data, signal:currentController.signal }); const result = await response.json(); if (!response.ok) throw new Error(result.error); if (blob !== recordingBlob) return; showSpeechResult(result.text); setAudioStatus(result.text ? 'Đã nhận giọng từ bản ghi.' : 'Chưa nhận ra lời nói. Hãy thử ghi âm lại.'); }
  catch (error) { if (error.name !== 'AbortError'&&blob===recordingBlob) {const message=error.message==='Failed to fetch'?'Không kết nối được dịch vụ nhận giọng. Bản ghi vẫn có thể nghe lại.':error.message||'Không kết nối được dịch vụ.';setAudioStatus(message);showPracticeError({title:'Chưa chuyển bản ghi thành chữ được',message,code:'microphone'});} }
  finally { if (button.isConnected) button.disabled = false; }
}
document.addEventListener('submit', event => { if (event.target.id === 'answer-form') handleAnswers(event); });
document.addEventListener('input', event => {
  const node = event.target;
  if (node.id.startsWith('answer-') && route.lesson) { state.drafts[draftKey(route.lesson.id,route.skill,route.bank,node.name.split('-')[1])] = node.value; save(); const feedback = $(`#feedback-${node.name.split('-')[1]}`); if (feedback) feedback.textContent = ''; node.className = ''; node.removeAttribute('aria-invalid'); $('#exercise-result').textContent = ''; }
  if (node.id === 'writing-text') { state.drafts[draftKey(route.lesson.id,'writing',route.bank)] = node.value; save(); $('#word-count').textContent = `${wordCount(node.value)} / ${getExercise(route.lesson,'writing',route.bank).min}–${getExercise(route.lesson,'writing',route.bank).max} từ`; $('#draft-status').textContent = 'Bản nháp đã cập nhật'; $('#writing-result').textContent = ''; }
  if (node.id === 'vocab-search') renderVocab();
});
document.addEventListener('change', async event => {
  const node = event.target;
  if(node.id==='textbook-file'&&node.files[0]&&runtime()?.importTextbook){node.disabled=true;try{await runtime().importTextbook(node.files[0]);caps=(await (await apiFetch('/api/capabilities')).json());updateCapabilities();toast('Đã lưu PDF trên iPad. Bạn có thể mở sách từ bài học.','success');}catch(error){toast(error.message||'Chưa nhập được PDF. Hãy thử lại.');}finally{node.disabled=false;node.value='';}return;}
  if (node.id === 'speed') { state.settings.rate = Number(node.value); save(); }
  if (node.id === 'fold-yo') { state.settings.foldYo = node.checked; save(); }
  if (node.id === 'vocab-lesson') renderVocab();
  if (node.id === 'book-track') { $('#book-audio').pause(); $('#book-audio').src = node.value; $('#book-audio-status').textContent = 'Chạm nút phát. Câu hỏi của sách nằm trong PDF, không phải bộ câu hỏi bổ trợ bên cạnh.'; }
  if (node.id === 'book-loop') $('#book-audio').loop = node.checked;
  if (node.id === 'backup-file' && node.files[0]) {
    try { if (node.files[0].size > 1024*1024) throw new Error('File quá lớn (tối đa 1 MB).'); const data = JSON.parse(await node.files[0].text()); if (!validateBackup(data, lessons.map(l => l.id))) throw new Error('File sao lưu không đúng cấu trúc. Dữ liệu hiện tại được giữ nguyên.'); pendingBackup={version:1,progress:data.progress,drafts:data.drafts,setResults:data.setResults||{},activity:data.activity||[],settings:{rate:Number(data.settings.rate),foldYo:data.settings.foldYo}};
      openDialog({title:'Khôi phục hành trình học?',subtitle:'Dữ liệu hiện tại trên thiết bị sẽ được thay bằng bản sao lưu.',body:'<p>Bản sao lưu hợp lệ có '+Object.keys(data.progress).length+' kết quả kỹ năng và '+Object.keys(data.drafts).length+' bản nháp. Bạn có thể hủy và xuất dữ liệu hiện tại trước khi khôi phục.</p>',footer:'<button class="btn secondary" data-action="close-dialog">Giữ dữ liệu hiện tại</button><button class="btn coral" data-action="confirm-restore">Khôi phục bản sao lưu</button>'}); }
    catch (error) { toast(error.message); node.value = ''; }
  }
});
document.addEventListener('click', async event => {
  if (event.target.closest('#skip-link')) { event.preventDefault(); $('#main').focus(); return; }
  const button = event.target.closest('[data-action]'); if (!button) return;
  const action = button.dataset.action;
  if (action === 'listen') { $('#book-audio')?.pause(); const text = route.skill === 'speaking' ? route.lesson.speaking[phraseIndex].text : getExercise(route.lesson,route.skill,route.bank).text; audio.speak(text, state.settings.rate, () => $('#player')?.classList.remove('playing')); }
  if (action === 'stop-audio') { audio.stopSpeech(); $('#player')?.classList.remove('playing'); setAudioStatus('Đã dừng. Chạm Nghe để phát lại từ đầu.'); }
  if (action === 'word') audio.speak(button.dataset.word, state.settings.rate);
  if (action === 'test-voice') audio.speak('Здравствуйте! Я изучаю русский язык.', state.settings.rate);
  if (action === 'retry') { getExercise(route.lesson,route.skill,route.bank).questions.forEach((q,i) => { delete state.drafts[draftKey(route.lesson.id,route.skill,route.bank,i)]; }); save(); render(); $('#answer-0').focus(); }
  if (action === 'phrase') { phraseIndex = Number(button.dataset.index); render(); $(`[data-action="phrase"][data-index="${phraseIndex}"]`).focus({preventScroll:true}); }
  if (action === 'recognize') {
    if (audio.recognition) { audio.stopRecognition(); return; }
    const started = audio.recognize((final, interim) => { const node = $('#speech-text'); if (node) node.textContent = `${final} ${interim}`.trim(); }, final => { button.classList.remove('recording'); button.setAttribute('aria-label','Bắt đầu nhận giọng'); if ($('#mic-label')) $('#mic-label').textContent = 'Chạm để thử lại'; if (final) showSpeechResult(final); });
    if (started) { $('#speech-score').textContent = ''; button.classList.add('recording'); button.setAttribute('aria-label','Dừng nhận giọng'); $('#mic-label').textContent = 'Đang nghe · Chạm để dừng'; }
  }
  if (action === 'record') {
    if (audio.recorder?.state === 'recording') { audio.stopRecord(); return; }
    button.disabled = true; const activeAudio = audio; recordingBlob = null; controller?.abort(); $('#online-transcription').hidden = true; $('#recording-preview audio')?.pause();
    const started = await activeAudio.record((blob,url) => { recordingBlob = blob; $('#recording-preview').innerHTML = '<audio controls playsinline aria-label="Nghe lại bản ghi"></audio>'; $('#recording-preview audio').src = url; $('#online-transcription').hidden = !caps.transcription; }, () => { if (button.isConnected) { button.innerHTML = `${icon('mic')} Ghi âm lại`; button.classList.remove('recording'); } });
    if (button.isConnected) { button.disabled = false; if (started) { button.innerHTML = `${icon('stop')} Dừng ghi âm`; button.classList.add('recording'); } }
  }
  if (action === 'transcribe') await transcribe();
  if (action === 'writing-check') await checkWriting();
  if (action === 'replace') { const node = $('#writing-text'), result = $('#writing-result'); if (node.value !== result.dataset.snapshot) { toast('Bài viết đã đổi. Kiểm tra lại trước khi áp dụng gợi ý.'); return; } const start = Number(button.dataset.offset), length = Number(button.dataset.length); node.value = node.value.slice(0,start) + button.dataset.replacement + node.value.slice(start+length); node.dispatchEvent(new Event('input',{bubbles:true})); node.focus(); toast('Đã sửa một chỗ. Kiểm tra lại để cập nhật các gợi ý còn lại.','success'); }
  if (action === 'export') { if(runtime()?.exportBackup){try{await runtime().exportBackup(JSON.stringify(state,null,2),`russian-kitty-${localDate()}.json`);}catch{toast('Chưa xuất được bản sao lưu. Hãy thử lại.');}return;} const blob = new Blob([JSON.stringify(state,null,2)],{type:'application/json'}), url = URL.createObjectURL(blob), anchor = document.createElement('a'); anchor.href = url; anchor.download = `nga-ngo-a1-${localDate()}.json`; anchor.click(); setTimeout(() => URL.revokeObjectURL(url),3000); }
  if(action==='reset')openDialog({title:'Xóa dữ liệu trên thiết bị?',subtitle:'Bản nháp và tiến độ của thiết bị này sẽ bị xóa.',body:'<p>Hãy xuất bản sao lưu trước nếu bạn muốn giữ lại hành trình học. Thao tác này không xóa file PDF hay bản sao lưu đã tải.</p>',footer:'<button class="btn secondary" data-action="close-dialog">Giữ lại dữ liệu</button><button class="btn danger" data-action="confirm-reset">Xóa bản nháp và tiến độ</button>'});
  if(action==='confirm-reset'){closeDialog();state=defaults();save();render();toast('Đã xóa bản nháp và tiến độ trên thiết bị này.','success');}
  if(action==='confirm-restore'&&pendingBackup){state=pendingBackup;pendingBackup=null;closeDialog();save();render();toast('Đã khôi phục bản nháp và tiến độ.','success');}
  if(action==='close-dialog')closeDialog();
  if(action==='open-settings'){closeDialog();if(location.hash==='#settings')return;location.hash='#settings';}
  if(action==='retry-writing'){closeDialog();await checkWriting();}
  if(action==='dismiss-toast'){$('#toast').hidden=true;clearTimeout(toastTimer);}
  if(action==='choose-set')showSetPicker();
  if(action==='select-set'){const url=bankUrl(route.lesson,route.skill,button.dataset.bank);closeDialog();if(location.hash===url)return;location.hash=url;}
  if(action==='next-set')location.hash=nextSetUrl(route.lesson,route.skill);
  if(action==='retry-wrong'){
    const wrong=$$('#answer-form input[aria-invalid="true"]');
    wrong.forEach(input=>{const i=input.name.split('-')[1];input.value='';input.className='';input.removeAttribute('aria-invalid');delete state.drafts[draftKey(route.lesson.id,route.skill,route.bank,i)];$('#feedback-'+i).textContent='';});
    save();$('#exercise-result').textContent='';wrong[0]?.focus();toast('Đã giữ câu đúng. Bạn chỉ cần điền lại các câu vừa sai.');
  }
});
window.addEventListener('hashchange', () => { phraseIndex = 0; render(true); });
window.addEventListener('pagehide', () => audio?.dispose());
window.addEventListener('pageshow', event => { if (event.persisted) render(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) { audio?.stopRecognition(); audio?.stopRecord(); audio?.stopSpeech(); $('#player')?.classList.remove('playing'); } });
function updateConnection() { $('#connection').textContent = navigator.onLine ? 'Sẵn sàng học' : 'Đang ngoại tuyến'; }
window.addEventListener('online',updateConnection); window.addEventListener('offline',updateConnection);

initializeDialogs();
render(); updateConnection(); if (localIssue) toast(localIssue);
apiFetch('/api/capabilities').then(r => r.ok ? r.json() : Promise.reject()).then(data => { caps = data; updateCapabilities(); }).catch(() => { updateCapabilities(); });
// Keep local development reloads fresh; deployed HTTPS apps cache the PWA shell.
if (!isInstalled() && 'serviceWorker' in navigator && window.isSecureContext && !['localhost','127.0.0.1','[::1]'].includes(location.hostname)) navigator.serviceWorker.register('/sw.js').catch(() => {});
