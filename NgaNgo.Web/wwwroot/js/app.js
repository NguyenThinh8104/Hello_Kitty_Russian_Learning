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
const skillNames = { listening:'Listening', speaking:'Speaking', reading:'Reading', writing:'Writing' };
const skillIcons = { listening:'headphones', speaking:'mic', reading:'book', writing:'pen' };
const storageKey = 'nga-ngo-a1-v1';
const defaults = () => ({ version:1, progress:{}, drafts:{}, setResults:{}, activity:[], settings:{ rate:.85, foldYo:false } });
let state = defaults(), route, audio, controller, phraseIndex = 0, recordingBlob, toastTimer, caps = { transcription:false };
let localIssue = '', pendingBackup = null;
try { const saved = JSON.parse(localStorage.getItem(storageKey) || 'null'); if (saved && validateBackup(saved, lessons.map(l => l.id))) state = saved; else if (saved) localIssue = 'This saved data is incompatible. Import a valid backup to restore your progress.'; } catch { localIssue = 'Storage is unavailable or saved data is damaged. Export a backup before closing the app.'; }
function save() { try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch { toast('Your changes could not be saved. Export a backup in Settings.','error'); } }
function toast(message,tone='info') {
  const node=$('#toast'); node.dataset.tone=tone; node.hidden=false;
  node.innerHTML=`<div class="toast-card"><span class="toast-symbol">${icon(tone==='success'?'check':tone==='error'?'stop':'book')}</span><div class="toast-copy"><strong>${tone==='success'?'Updated':tone==='error'?'Something went wrong':'A quick note'}</strong><p>${esc(message)}</p></div><button class="toast-dismiss" data-action="dismiss-toast" aria-label="Dismiss notification">×</button></div>`;
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
function heading(eyebrow, title, subtitle = '') { return `<div class="page-heading"><div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p class="page-subtitle">${subtitle}</p></div><span class="date-pill">${esc(new Intl.DateTimeFormat('en-GB', { weekday:'long', day:'numeric', month:'long' }).format(new Date()))}</span></div>`; }
function bookStrip() { return `<div class="book-strip"><span class="book-cover" lang="ru">Я♥</span><div><strong lang="ru">${esc(course.title)}</strong><p>I Love Russian for Beginners · ${esc(course.edition)} · Supplementary practice by topic</p></div></div>`; }
function card(lesson, i) { const count = practiced(lesson.id); return `<a class="lesson-card" href="#lesson/${lesson.id}/listening"><div class="card-top"><span class="lesson-symbol ${lesson.color}" lang="ru">${esc(lesson.symbol)}</span><span class="card-number">LESSON ${String(lesson.number || i+1).padStart(2,'0')}</span></div><h3 lang="ru">${esc(lesson.title)}</h3><p>${esc(lesson.subtitle)}<br><span class="helper">18 listening/reading questions · 6 speaking phrases · 3 writing prompts</span></p><div class="card-meta"><span>Listen · Speak · Read · Write</span><span>${count}/4 practiced</span></div><progress max="4" value="${count}" aria-label="${count} of 4 skills practiced"></progress></a>`; }
function stats() { const complete = lessons.filter(l => practiced(l.id) === 4).length; return `<div class="stats"><div class="stat"><div class="stat-icon">${icon('flame')}</div><div><strong>${streak()} days</strong><span>Practice streak</span></div></div><div class="stat"><div class="stat-icon">${icon('book')}</div><div><strong>${complete}/${lessons.length} lessons</strong><span>All 4 skills practiced</span></div></div><div class="stat"><div class="stat-icon">${icon('check')}</div><div><strong>${Object.keys(state.progress).length} sessions</strong><span>Lesson and skill sessions</span></div></div></div>`; }
function home() {
  const next = nextLesson();
  return `${heading('ПРИВЕТ! · HELLO', 'A little Russian, every day.', 'Start with your first sentences. Build confidence with every lesson.')}
  <section class="hero"><div class="hero-copy"><div class="eyebrow">YOUR A1 JOURNEY</div><h2 lang="ru">Каждый день —<br>по-русски.</h2><p>Listen closely, speak aloud, read to understand, and write your own story. Every lesson has several practice sets to explore.</p><a class="btn coral" href="#lesson/${next.id}/listening">${icon('play')} ${practiced(next.id) ? 'Continue learning' : 'Start learning'}</a></div><div class="hero-art" aria-hidden="true"><div class="letter-card" lang="ru">Аа<span>НАЧИНАЕМ</span></div><div class="letter-card second" lang="ru">Я<span>ЛЮБЛЮ РУССКИЙ</span></div><span class="orbit-letter">Привет!</span></div></section>
  ${stats()}<div class="section-heading"><h2>Lessons for you</h2><a class="text-link" href="#lessons">View learning path</a></div><div class="lesson-grid">${lessons.slice(0,6).map(card).join('')}</div><div class="note"><strong>A companion to the 2017 textbook.</strong> ${esc(course.notice)}</div>`;
}
function lessonList() { return `${heading('ВАШ ПУТЬ · YOUR LEARNING PATH', 'From «Привет!» to your own story.', '14 lessons · 252 listening/reading questions · 84 speaking phrases · 42 writing prompts. Each lesson includes 3 listening sets, 3 reading sets, and 3 writing tasks.')}${bookStrip()}<div class="lesson-grid">${lessons.map(card).join('')}</div><div class="note">${esc(course.notice)}</div>`; }
function lessonView(lesson, skill) {
  return `<div class="breadcrumb"><a href="#lessons">Learning path</a><span>/</span><span>Lesson ${lesson.number || lessons.indexOf(lesson)+1}</span></div><div class="lesson-heading"><span class="lesson-symbol ${lesson.color}" lang="ru">${esc(lesson.symbol)}</span><div><h1 lang="ru">${esc(lesson.title)}</h1><p>${esc(lesson.goal)}</p></div></div><p class="lesson-source">${lesson.pages ? `2017 textbook · printed pages ${esc(lesson.pages)} · ` : ''}Original supplementary practice · Google Translate voice for practice passages</p>
  <nav class="tabs" aria-label="Skills">${Object.entries(skillNames).map(([key,label]) => `<a class="tab ${key === skill ? 'active' : ''}" href="#lesson/${lesson.id}/${key}" ${key === skill ? 'aria-current="page"' : ''}>${icon(skillIcons[key])}${label}${state.progress[`${lesson.id}:${key}`] ? '<small>✓</small>' : ''}</a>`).join('')}</nav>
  ${skill !== 'speaking' ? exerciseToolbar(lesson,skill) : ''}
  ${skill === 'listening' || skill === 'reading' ? comprehension(lesson, skill) : skill === 'speaking' ? speaking(lesson) : writing(lesson)}
  ${skill !== 'speaking' ? sessionNavigation(lesson,skill) : ''}<div class="note"><strong>Grammar notes.</strong> ${esc(lesson.grammar)}</div>`;
}
function speedSelect() { return `<select id="speed" aria-label="Playback speed">${[.65,.85,1].map(rate => `<option value="${rate}" ${state.settings.rate === rate ? 'selected' : ''}>${rate === .65 ? 'Slow' : rate === .85 ? 'Steady' : 'Natural'} · ${rate}×</option>`).join('')}</select>`; }
function bankUrl(lesson,skill,bank='core'){return `#lesson/${lesson.id}/${skill}${skill==='speaking'?'':`/${bank}`}`;}
function exerciseToolbar(lesson,skill){
  const sets=getExercises(lesson,skill), task=getExercise(lesson,skill,route.bank), index=sets.indexOf(task), result=setResult(state,lesson.id,skill,task.id);
  return `<section class="exercise-toolbar" aria-label="Current practice set"><div><div class="eyebrow">${esc(skillNames[skill])} · ${esc(task.label)}</div><h2 lang="ru">${esc(task.title)}</h2><p>${esc(task.focus||(skill==='writing'?task.guide:'Practice comprehension and choose the correct word forms.'))}</p><div class="set-summary" aria-label="${practicedSets(state,lesson,skill)} of ${sets.length} sets practiced">${sets.map(s=>`<span class="set-dot ${setResult(state,lesson.id,skill,s.id)?'done':''} ${s.id===task.id?'current':''}" aria-hidden="true"></span>`).join('')}</div></div><div class="set-controls"><span class="set-count">Set ${index+1} / ${sets.length}${result?' · Practiced':''}</span><button class="btn secondary small" data-action="choose-set">Choose a set</button></div></section>`;
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
  return `<nav class="set-navigation" aria-label="Practice set navigation">${index?`<a class="btn secondary" href="${bankUrl(lesson,skill,sets[index-1].id)}">Previous set</a>`:'<span class="helper">First set</span>'}<a class="btn soft" href="${nextSetUrl(lesson,skill)}">${last?skill==='listening'?'Continue to speaking':skill==='reading'?'Continue to writing':'Continue learning':'Next set'}</a></nav>`;
}
function showSetPicker(){
  const {lesson,skill,bank}=route;
  openDialog({title:`Choose a practice set for ${skillNames[skill].toLowerCase()}`,subtitle:`Lesson ${lesson.number} · ${lesson.title} · Trang ${lesson.pages}. Drafts and results are saved separately for each set.`,wide:true,
    body:`<div class="set-grid">${getExercises(lesson,skill).map((task,index)=>{const result=setResult(state,lesson.id,skill,task.id);return `<button class="set-option ${bank===task.id?'selected':''}" data-action="select-set" data-bank="${task.id}" aria-label="Choose set ${index+1}: ${esc(task.title)}" ${bank===task.id?'aria-current="true"':''}><span class="set-number">${String(index+1).padStart(2,'0')}</span><small>${esc(task.label)}</small><strong lang="ru">${esc(task.title)}</strong><small>${esc(task.focus||(skill==='writing'?`${task.min}–${task.max} words`:`${task.questions.length} typed-answer questions`))}</small><span class="set-state">${result?skill==='writing'?'Checked online':`Best score: ${result.best}%`:bank===task.id?'Current set':'Ready to practice'}</span></button>`;}).join('')}</div>`,
    footer:'<button class="btn secondary" data-action="close-dialog">Back to your lesson</button>'});
}
function showPracticeError({title,message,code}){
  const voice=code==='voice';
  openDialog({title,subtitle:'Your lesson is saved. You can return whenever you are ready.',variant:'error',
    body:`<div class="error-illustration" aria-hidden="true">${icon(voice?'headphones':'mic')}</div><p class="error-message">${esc(message)}</p><div class="error-help">${voice?'Practice audio uses Google Translate and needs Internet the first time it loads. Tap Listen to retry. Original textbook recordings are also available.':'Allow Microphone and Speech Recognition for Russian Kitty in your device settings. You can also record yourself and listen back.'}</div>`,
    footer:'<button class="btn secondary" data-action="close-dialog">Back to lesson</button><button class="btn coral" data-action="open-settings">View help</button>'});
}
function showWritingError(message){
  openDialog({title:'Writing check unavailable',subtitle:'Your draft is still saved on this device.',variant:'error',
    body:`<div class="error-illustration" aria-hidden="true">${icon('pen')}</div><p class="error-message">${esc(message)}</p><div class="error-help">Check your Internet connection. If the service is busy or has reached its limit, try again later. You can keep writing meanwhile.</div>`,
    footer:'<button class="btn secondary" data-action="close-dialog">Keep writing</button><button class="btn coral" data-action="retry-writing">Try again</button>'});
}
function progressCell(lesson,skill){
  const result=state.progress[`${lesson.id}:${skill}`];
  if(skill==='speaking')return result?`${result.best}%<small>Best word match</small>`:'Not practiced';
  const count=practicedSets(state,lesson,skill),total=getExercises(lesson,skill).length;
  return count?`${count}/${total} sets<small>${skill==='writing'?'Online feedback received':'Answers checked'}</small>`:'Not practiced';
}
function originalAudio(lesson) {
  const tracks = bookAudio[lesson.number] || [];
  return `<details class="original-audio"><summary>Original textbook recordings · Module 1</summary><p class="helper">Audio provided by Liden & Denz. Use these with the textbook exercises on PDF pages ${esc(lesson.pages)}. The typed questions in this app belong to the supplementary passage above.</p>${tracks.length ? `<label for="book-track" class="helper">Choose a track by its textbook exercise number</label><select id="book-track">${tracks.map(t => `<option value="${esc(t.url)}">${esc(t.label)}</option>`).join('')}</select><audio id="book-audio" controls playsinline preload="none" src="${esc(tracks[0].url)}"></audio><label class="check-row"><input type="checkbox" id="book-loop">Repeat this track</label><p id="book-audio-status" class="helper" role="status">Internet is required for original recordings.</p>` : '<p class="helper">No Module 1 track has been verified for this lesson. Visit the source page to check available materials.</p>'}<a class="text-link" href="${esc(lesson.bookAudio)}" target="_blank" rel="noopener">Open Liden & Denz audio page</a></details>`;
}
function comprehension(lesson, skill) {
  const exercise = getExercise(lesson,skill,route.bank), listening = skill === 'listening';
  const left = listening ? `<section class="panel audio-panel" id="player"><div class="eyebrow">СЛУШАЕМ · LISTEN AND UNDERSTAND</div><div class="audio-emblem">${icon('headphones')}</div><h2 lang="ru">${esc(exercise.title)}</h2><p>Listen as often as you need.<br>Type your answers alongside the passage.</p><div class="wave" aria-hidden="true">${'<i></i>'.repeat(23)}</div><div class="player-actions"><button class="btn" data-action="listen">${icon('play')} Listen to passage</button><button class="btn secondary" data-action="stop-audio" aria-label="Stop playback">${icon('stop')}</button></div><div class="speed-row"><span>Speed</span>${speedSelect()}</div><p class="status-text" id="audio-status" role="status">Google Translate voice · Russian.</p><details class="transcript"><summary>Show transcript after listening</summary><p lang="ru" class="russian-text">${esc(exercise.text)}</p></details></section>` : `<section class="panel"><div class="eyebrow">ЧИТАЕМ · READ AND EXPLORE</div><h2 lang="ru">${esc(exercise.title)}</h2><p class="russian-text" lang="ru">${esc(exercise.text)}</p><button class="btn soft small" data-action="listen">${icon('volume')} Listen to passage</button><p id="audio-status" class="status-text" role="status"></p><p class="helper">Fill in the missing words using the passage. Keep the correct endings for the context.</p></section>`;
  return `<div class="exercise-grid"><div>${left}${listening ? originalAudio(lesson) : ''}</div><section class="panel"><div class="eyebrow">${listening ? 'WHAT DID YOU HEAR?' : 'CHECK YOUR UNDERSTANDING'}</div><h2>Type your answers</h2><p class="helper">Use Cyrillic letters. ${state.settings.foldYo ? 'Accept е thay ё.' : 'Distinguish е and ё.'} Capitalization and stress marks do not affect the result.</p><form id="answer-form">${exercise.questions.map((q,i) => `<div class="question"><div class="question-header">QUESTION ${i+1} / ${exercise.questions.length}</div><label lang="ru" for="answer-${i}">${esc(q.prompt)}</label><input id="answer-${i}" name="answer-${i}" lang="ru" autocomplete="off" autocapitalize="off" spellcheck="false" maxlength="200" aria-required="true" value="${esc(state.drafts[draftKey(lesson.id,skill,route.bank,i)] || '')}"><div id="feedback-${i}" aria-live="polite"></div><details class="hint"><summary>Hint</summary>${esc(q.hint)}</details></div>`).join('')}<div class="form-actions"><button class="btn coral" type="submit">${icon('check')} Check answers</button><button class="text-link" type="button" data-action="retry">Try again</button></div></form><div id="exercise-result" aria-live="polite"></div><p class="kbd-note">iPad: Settings > General > Keyboard > Add New Keyboard > Russian.</p></section></div>`;
}
function speaking(lesson) {
  const phrase = lesson.speaking[phraseIndex];
  return `<div class="exercise-grid"><section class="panel"><div class="eyebrow">ГОВОРИМ · SPEAK ALOUD</div><div class="speaking-list" aria-label="Choose a speaking phrase">${lesson.speaking.map((p,i) => `<button class="phrase-step ${i === phraseIndex ? 'active' : ''}" data-action="phrase" data-index="${i}" aria-label="Phrase ${i+1}" aria-pressed="${i === phraseIndex}">${i+1}</button>`).join('')}</div><h2>Listen, then say it aloud</h2><p class="speaking-phrase" lang="ru">${esc(phrase.text)}</p><p class="muted">${esc(phrase.translation)}</p><button class="btn soft" data-action="listen">${icon('volume')} Listen to model</button><div class="grammar"><h3>Pronunciation tips</h3><p>${esc(phrase.tip)}</p></div><div class="recording-box"><h3>Record and listen back</h3><p class="helper">Record up to 30 seconds. Recordings are not uploaded automatically.</p><button class="btn secondary" id="record-button" data-action="record">${icon('mic')} Record</button><div id="recording-preview"></div><div id="online-transcription" hidden><label class="consent"><input type="checkbox" id="speech-consent"><span>I agree to send this recording to OpenAI for transcription. The server owner may incur a charge. <a href="https://openai.com/policies/privacy-policy/" target="_blank" rel="noopener">Privacy policy</a>.</span></label><button class="btn soft small" id="transcribe-button" data-action="transcribe">Transcribe recording</button></div><p class="helper" id="server-speech-note">Checking transcription availability…</p></div></section><section class="panel center"><div class="eyebrow">YOU SPEAK · THE APP LISTENS</div><h2>Try speaking Russian</h2><p class="helper">Tap the microphone and read the model sentence.<br>Allow microphone access when prompted.</p><button class="mic-button" id="recognize-button" data-action="recognize" aria-label="Start speech recognition">${icon('mic')}</button><p id="mic-label" class="helper">Tap to start</p><p id="audio-status" role="status" class="status-text"></p><div class="speaking-result" id="speech-text" lang="ru">Your recognized words will appear here.</div><div id="speech-score" aria-live="polite"></div><p class="helper">This compares recognized words with the model sentence. It does not score pronunciation, stress, or intonation.</p><p class="helper">On iPad, Apple provides speech recognition and may process audio online. Windows supports recording and playback. If recognition is unavailable, try recording yourself.</p></section></div>`;
}
function writing(lesson) {
  const w = getExercise(lesson,'writing',route.bank), text = state.drafts[draftKey(lesson.id,'writing',route.bank)] || '';
  return `<div class="exercise-grid"><section class="panel"><div class="eyebrow">ПИШЕМ · WRITE YOUR OWN STORY</div><h2 lang="ru">${esc(w.title)}</h2><p class="writing-prompt" lang="ru">${esc(w.prompt)}</p><p class="helper">${esc(w.guide)} Target ${w.min}–${w.max} words.</p><div class="subtle-rule"></div><h3>Sentence starters</h3>${w.starters.map(s => `<span class="starter" lang="ru">${esc(s)}</span>`).join('')}<details class="sample"><summary>Show sample answer</summary><p lang="ru" class="russian-text">${esc(w.sample)}</p></details><p class="helper">Write your own response. The sample only suggests ways to express your ideas.</p></section><section class="panel"><h2><label for="writing-text">Your writing</label></h2><textarea id="writing-text" lang="ru" rows="10" maxlength="5000" placeholder="Начните здесь…" spellcheck="false">${esc(text)}</textarea><div class="writing-meta"><span id="word-count">${wordCount(text)} / ${w.min}–${w.max} words</span><span id="draft-status">Save draft on this device</span></div><label class="consent"><input type="checkbox" id="writing-consent"><span>I agree to send my writing to <a href="https://languagetool.org/legal/privacy" target="_blank" rel="noopener">LanguageTool</a> for checking. It is sent only when I press the button below.</span></label><div class="form-actions"><button class="btn coral" id="writing-check" data-action="writing-check">${icon('check')} Check writing online</button></div><p class="provider">Check spelling and selected grammar rules with <a href="https://languagetool.org" target="_blank" rel="noopener">LanguageTool</a>. The service does not fully assess meaning, naturalness, or whether you answered the prompt. No detected errors does not mean a perfect response.</p><div id="writing-result" class="result-region" aria-live="polite"></div></section></div>`;
}
function vocabulary() { return `${heading('СЛОВАРЬ · YOUR WORD COLLECTION', 'Meet new words. Remember a little more.', 'Tap the speaker to hear a word. Acute accents on Russian words show the stressed syllable.')}<div class="vocab-toolbar"><input id="vocab-search" type="search" placeholder="Search Russian words or English meanings…" aria-label="Search vocabulary"><select id="vocab-lesson" aria-label="Filter by lesson"><option value="all">All lessons</option>${lessons.map(l => `<option value="${l.id}">${l.number}. ${esc(l.title)}</option>`).join('')}</select></div><div id="audio-status" class="status-text" role="status"></div><div id="vocab-results"></div>`; }
function renderVocab() { const query = normalize($('#vocab-search').value, true), filter = $('#vocab-lesson').value; const words = lessons.filter(l => filter === 'all' || l.id === filter).flatMap(l => l.vocab.map(([ru,vi]) => ({ ru,vi,lesson:l }))).filter(w => normalize(`${w.ru} ${w.vi}`, true).includes(query)); $('#vocab-results').innerHTML = `<p class="search-count">${words.length} words · Key vocabulary selected by lesson topic</p><div class="vocab-grid">${words.map(w => `<article class="vocab-card"><div class="vocab-top"><strong lang="ru">${esc(w.ru)}</strong><button class="icon-button" data-action="word" data-word="${esc(w.ru)}" aria-label="Listen to ${esc(w.ru)}">${icon('volume')}</button></div><p>${esc(w.vi)}</p><small>Lesson ${w.lesson.number} · ${esc(w.lesson.title)}</small></article>`).join('')}</div>${words.length ? '' : '<p class="empty-state">No words found. Try another search.</p>'}`; }
function alphabetView() { return `${heading('АЗБУКА · YOUR FIRST STEPS', '33 letters. A whole new world.', 'Tap a letter to hear its Russian name.')}<div id="audio-status" class="status-text" role="status"></div><div class="alphabet-grid">${alphabet.map(([letter,name]) => `<button class="letter-tile" data-action="word" data-word="${esc(name)}" aria-label="Hear letter ${esc(letter)}"><strong lang="ru">${esc(letter)}</strong><span lang="ru">${esc(name)}</span></button>`).join('')}</div><div class="note"><strong>Start with the sounds.</strong> Ь and Ъ do not represent separate sounds. Е, ё, ю, я can soften the preceding consonant. Ё is stressed in ordinary words. Letter names are a starting point; practice their sounds in words as well.</div>`; }
function progressView() { return `${heading('МОЙ ПРОГРЕСС · YOUR LEARNING JOURNEY', 'Every small step counts.', 'Progress and drafts are stored on this device. Export a backup to move them to another device.')}${stats()}<section class="panel table-wrap"><h2>Progress by lesson</h2><p class="helper">Listening, reading, and writing show practiced sets. Speaking shows your best word match, not a pronunciation score.</p><table><thead><tr><th>LESSON</th>${Object.values(skillNames).map(s => `<th>${s.toUpperCase()}</th>`).join('')}</tr></thead><tbody>${lessons.map(l => `<tr><td><a href="#lesson/${l.id}/listening"><strong lang="ru">${l.number}. ${esc(l.title)}</strong></a></td>${Object.keys(skillNames).map(skill => { const result = state.progress[`${l.id}:${skill}`]; return `<td><a class="skill-pill ${result ? 'done' : ''}" href="#lesson/${l.id}/${skill}">${progressCell(l,skill)}</a></td>`; }).join('')}</tr>`).join('')}</tbody></table></section>`; }
function settingsView() { return `${heading('НАСТРОЙКИ · MAKE IT YOURS', 'Your Russian Kitty.', 'Google Translate voice, app preferences, and your Russian learning journey.')}<div class="settings-grid"><section class="panel"><h2>Practice preferences</h2><div class="field"><label for="speed">Default playback speed</label>${speedSelect()}</div><label class="check-row"><input type="checkbox" id="fold-yo" ${state.settings.foldYo ? 'checked' : ''}>Accept е thay ё when checking listening/reading answers</label><p class="helper">By default, distinguish е and ё for accurate spelling practice. Speaking accepts both.</p><div class="subtle-rule"></div><h3>Google Translate voice · Русский</h3><p id="voice-status" class="helper"></p><button class="btn soft small" data-action="test-voice">${icon('volume')} Test voice</button><p id="audio-status" class="status-text" role="status"></p></section><section class="panel"><h2>${isInstalled()?'Your app is ready':'The Russian Kitty app'}</h2><p class="helper">${isInstalled()?'You are using the installed app. Lessons and the interface are stored on your device; Safari and a separate server are not required.':'This is the browser preview. Open Russian Kitty.exe for the Windows app. The iPad app can be built with Xcode or GitHub Actions.'}</p><p class="helper">Google Translate audio and writing checks need Internet. The iPad app uses iOS microphone and speech recognition services.</p><p class="helper">Add a Russian keyboard: Settings > General > Keyboard > Add New Keyboard > Russian.</p></section><section class="panel"><h2>Drafts & progress</h2><p class="helper">Progress stays on this device and is not synced to an account. Use backups to move between the browser, the app, and other devices.</p><button class="btn secondary" data-action="export">${icon('download')} Export backup</button><div class="field"><label for="backup-file">Restore from a JSON file</label><input class="file-input" id="backup-file" type="file" accept=".json,application/json"><p class="helper">Restoring replaces the current data on this device.</p></div><details><summary class="text-link">Delete local data</summary><p class="helper">Export a backup before deleting.</p><button class="btn danger small" data-action="reset">Delete drafts and progress</button></details></section><section class="panel"><h2>Textbook & content</h2>${runtime()?.importTextbook?'<div class="field"><label for="textbook-file">Add textbook PDF from Files</label><input class="file-input" id="textbook-file" type="file" accept=".pdf,application/pdf"><p class="helper">PDF files up to 60 MB. The file stays in the app on your iPad and is not uploaded.</p></div>':''}<p class="helper"><strong lang="ru">${esc(course.title)}</strong><br>${esc(course.edition)} · Liden & Denz</p><p class="helper">${esc(course.notice)}</p><p class="helper">Original textbook recordings are separate from Google Translate practice audio. Speaking compares recognized words; it does not assess pronunciation. Writing still benefits from a teacher's review.</p><a class="resource-link" href="https://languagetool.org" target="_blank" rel="noopener">LanguageTool writing checks</a><p class="helper" id="capability-status"></p></section></div>`; }
function updateVoiceStatus() { const node=$('#voice-status');if(node)node.textContent='Russian voice from Google Translate. Internet is needed to load audio; recently played clips are kept temporarily for replay during this session.'; }
function setAudioStatus(message) { const node = $('#audio-status'); if (node) node.textContent = message; else toast(message); $('#player')?.classList.toggle('playing',message.startsWith('Playing')); }
function render(focus = false) {
  audio?.dispose(); controller?.abort(); recordingBlob = null; closeDialog();
  const parts = (location.hash.slice(1) || 'home').split('/');
  route = { page:parts[0], lesson:lessons.find(l => l.id === parts[1]), skill:parts[2], bank:parts[3]||'core' };
  if (route.page === 'lesson' && (!route.lesson || !Object.hasOwn(skillNames, route.skill) || (route.skill!=='speaking'&&!getExercise(route.lesson,route.skill,route.bank)))) { location.hash = 'lessons'; return; }
  const navPage = route.page === 'lesson' ? 'lessons' : route.page;
  $('#navigation').innerHTML = [['home','home','Overview'],['lessons','book','Learning path'],['vocabulary','cards','Vocabulary'],['alphabet','letters','Alphabet'],['progress','chart','Progress']].map(([key,ico,label]) => `<a class="nav-item ${key === navPage ? 'active' : ''}" href="#${key}" aria-label="${label}" ${key === navPage ? 'aria-current="page"' : ''}>${icon(ico)}<span>${label}</span></a>`).join('');
  $('#main').innerHTML = route.page === 'home' ? home() : route.page === 'lessons' ? lessonList() : route.page === 'lesson' ? lessonView(route.lesson, route.skill) : route.page === 'vocabulary' ? vocabulary() : route.page === 'alphabet' ? alphabetView() : route.page === 'progress' ? progressView() : route.page === 'settings' ? settingsView() : `<p class="empty-state">Page not found. <a href="#home">Back to overview</a></p>`;
  document.title = `${route.lesson?.title || ({ home:'Overview', lessons:'Learning path', vocabulary:'Vocabulary', alphabet:'Alphabet', progress:'Progress', settings:'Settings' }[route.page] || 'Trang')} · Russian Kitty`;
  audio = new AudioPractice(setAudioStatus,showPracticeError);
  if (route.page === 'vocabulary') renderVocab();
  if (route.page === 'settings') updateVoiceStatus();
  const nativeAudio = $('#book-audio');
  if (nativeAudio) {
    nativeAudio.addEventListener('play', () => { audio.stopSpeech(); audio.stopRecognition(); audio.stopRecord(); });
    nativeAudio.addEventListener('error', () => { $('#book-audio-status').textContent = 'The original recording could not be loaded. Check your connection or open the Liden & Denz.'; });
  }
  updateCapabilities();
  if (focus) { window.scrollTo(0,0); $('#main').focus({ preventScroll:true }); }
}
function updateCapabilities() {
  const note = $('#server-speech-note');
  if (note) note.textContent = caps.nativeSpeech ? 'The iPad app uses iOS speech recognition. Allow Microphone and Speech Recognition when prompted.' : caps.transcription ? 'Online transcription is enabled. Record a clip to use it.' : 'You can record and listen back. The iPad app also supports Russian speech recognition through iOS.';
  const status = $('#capability-status');
  if (status) status.textContent = `Textbook PDF: ${caps.textbook ? 'available' : 'not added'}. Practice voice: Google Translate. Writing checks: LanguageTool, with Internet access.`;
  const source = $('.lesson-source');
  if (caps.textbook && source && !$('.book-pdf-link')) {
    const link = document.createElement('a'); link.className = 'book-pdf-link'; link.href = `/api/textbook#page=${Number(route.lesson.pages.split('–')[0])+1}`;
    if(isInstalled()){link.href='#';link.addEventListener('click',async event=>{event.preventDefault();try{await runtime().openTextbook();}catch{toast('The PDF could not be opened. Please try again.');}});}else link.target = '_blank'; link.rel = 'noopener'; link.textContent = isInstalled()?'Open textbook PDF':'Open textbook page'; source.append(' · ',link);
  }
}
function handleAnswers(event) {
  event.preventDefault(); const {lesson,skill,bank}=route, exercise=getExercise(lesson,skill,bank);
  const missing=exercise.questions.map((q,i)=>i).filter(i=>!$(`#answer-${i}`).value.trim());
  if(missing.length){toast(`There are ${missing.length} unanswered questions. Fill them in before checking.`);$(`#answer-${missing[0]}`).focus();return;}
  let count=0;
  exercise.questions.forEach((q,i)=>{
    const input=$(`#answer-${i}`), correct=isCorrect(input.value,q.answers,state.settings.foldYo);
    if(correct)count++;input.className=correct?'answer-good':'answer-bad';input.setAttribute('aria-invalid',String(!correct));
    $(`#feedback-${i}`).innerHTML=`<p class="feedback ${correct?'good':'bad'}">${correct?'✓ Correct.':`Answer: <strong lang="ru">${esc(q.answers.join(' / '))}</strong>.`} ${esc(q.explanation)}</p>`;
  });
  recordProgress(lesson.id,skill,Math.round(count/exercise.questions.length*100));
  const complete=count===exercise.questions.length;
  $('#exercise-result').innerHTML=`<div class="result-card ${complete?'':'review'}"><div class="result-top"><span class="result-symbol">${icon(complete?'check':'book')}</span><strong>${complete?'Отлично! Well done.':'Try once more to make it stick.'}</strong></div><p>You answered <strong>${count}/${exercise.questions.length}</strong> questions correctly in this set «${esc(exercise.title)}». Your best score is saved separately for this set.</p><div class="form-actions">${complete?'<button class="btn coral small" data-action="next-set">Keep practicing</button>':'<button class="btn coral small" data-action="retry-wrong">Retry incorrect answers</button>'}<button class="btn secondary small" data-action="choose-set">Choose another set</button></div></div>`;
}
function showSpeechResult(text, interim = '') { const node = $('#speech-text'); if (!node) return; node.textContent = text || interim || 'No speech was recognized.'; if (!text) return; const score = speechComparison(route.lesson.speaking[phraseIndex].text, text); $('#speech-score').innerHTML = `<div class="score">${score}%</div><p class="helper">Word match with the model · ${score === 100 ? 'All words matched.' : 'Compare the recognized text with the model and try again.'}</p>`; recordProgress(route.lesson.id, 'speaking', score); }
async function checkWriting() {
  const text = $('#writing-text').value, consent = $('#writing-consent').checked;
  if (!text.trim()) { toast('Write a few sentences before checking.'); return; }
  if (!/[А-Яа-яЁё]/.test(text)) { toast('Write in Russian using Cyrillic letters.'); return; }
  if (!consent) { toast('Agree to send your writing to LanguageTool first.'); return; }
  const button = $('#writing-check'); button.disabled = true; button.textContent = 'Checking…';
  const result = $('#writing-result'); result.textContent = 'Connecting to LanguageTool…';
  controller?.abort(); controller = new AbortController(); const currentController = controller, lesson = route.lesson, bank=route.bank, task = getExercise(lesson,'writing',bank);
  try {
    const response = await apiFetch('/api/writing/check', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({text,consent}), signal:currentController.signal });
    const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Your writing could not be checked.');
    if(controller!==currentController||route.lesson?.id!==lesson.id||route.skill!=='writing'||route.bank!==bank)return;
    if ($('#writing-text')?.value !== text) { result.textContent = 'Your draft changed during the check. Check the latest version again.'; return; }
    const matches = data.matches || [];
    if (wordCount(text) >= task.min) recordProgress(lesson.id, 'writing', 0,bank);
    result.innerHTML = `<div class="result-banner">${matches.length ? `Found ${matches.length} suggestions to review.` : 'LanguageTool did not detect any errors.'} ${wordCount(text) < task.min ? `Keep writing to reach at least ${task.min} words and record this practice session.` : 'Writing check saved.'} Content and naturalness have not been assessed.</div>${matches.map((m,i) => `<article class="correction"><p><mark lang="ru">${esc(text.slice(m.offset,m.offset+m.length) || '(insertion point)')}</mark> · ${esc(m.message)}</p>${m.replacements.map(replacement => `<button class="btn secondary small" data-action="replace" data-offset="${m.offset}" data-length="${m.length}" data-replacement="${esc(replacement)}" lang="ru">${esc(replacement)}</button>`).join('')}</article>`).join('')}`;
    result.dataset.snapshot = text;
  } catch (error) { if (error.name !== 'AbortError'&&controller===currentController&&route.lesson?.id===lesson.id&&route.bank===bank) { const message=error.message==='Failed to fetch'?'Could not connect to the server. Check your connection and retry.':error instanceof SyntaxError?'The server returned an invalid result. Try again later.':error.message; result.innerHTML = `<p class="online-error">${esc(message)}</p>`; showWritingError(message); } }
  finally { if (button.isConnected) { button.disabled = false; button.innerHTML = `${icon('check')} Check writing online`; } }
}
async function transcribe() {
  if (!recordingBlob) return;
  if (!$('#speech-consent').checked) { toast('Agree to send the recording before using online transcription.'); return; }
  const blob = recordingBlob, button = $('#transcribe-button'); button.disabled = true;
  const data = new FormData(); data.append('audio', blob, blob.type.includes('webm') ? 'recording.webm' : 'recording.mp4'); data.append('consent','true');
  controller?.abort(); controller = new AbortController(); const currentController = controller;
  setAudioStatus('Transcribing recording…');
  try { const response = await apiFetch('/api/speech/transcribe', { method:'POST', body:data, signal:currentController.signal }); const result = await response.json(); if (!response.ok) throw new Error(result.error); if (blob !== recordingBlob) return; showSpeechResult(result.text); setAudioStatus(result.text ? 'Transcription received.' : 'No speech was recognized. Try recording again.'); }
  catch (error) { if (error.name !== 'AbortError'&&blob===recordingBlob) {const message=error.message==='Failed to fetch'?'The transcription service could not be reached. You can still play your recording.':error.message||'The service could not be reached.';setAudioStatus(message);showPracticeError({title:'Transcription unavailable',message,code:'microphone'});} }
  finally { if (button.isConnected) button.disabled = false; }
}
document.addEventListener('submit', event => { if (event.target.id === 'answer-form') handleAnswers(event); });
document.addEventListener('input', event => {
  const node = event.target;
  if (node.id.startsWith('answer-') && route.lesson) { state.drafts[draftKey(route.lesson.id,route.skill,route.bank,node.name.split('-')[1])] = node.value; save(); const feedback = $(`#feedback-${node.name.split('-')[1]}`); if (feedback) feedback.textContent = ''; node.className = ''; node.removeAttribute('aria-invalid'); $('#exercise-result').textContent = ''; }
  if (node.id === 'writing-text') { state.drafts[draftKey(route.lesson.id,'writing',route.bank)] = node.value; save(); $('#word-count').textContent = `${wordCount(node.value)} / ${getExercise(route.lesson,'writing',route.bank).min}–${getExercise(route.lesson,'writing',route.bank).max} words`; $('#draft-status').textContent = 'Draft updated'; $('#writing-result').textContent = ''; }
  if (node.id === 'vocab-search') renderVocab();
});
document.addEventListener('change', async event => {
  const node = event.target;
  if(node.id==='textbook-file'&&node.files[0]&&runtime()?.importTextbook){node.disabled=true;try{await runtime().importTextbook(node.files[0]);caps=(await (await apiFetch('/api/capabilities')).json());updateCapabilities();toast('PDF saved on your iPad. Open it from any lesson.','success');}catch(error){toast(error.message||'PDF import failed. Please try again.');}finally{node.disabled=false;node.value='';}return;}
  if (node.id === 'speed') { state.settings.rate = Number(node.value); save(); }
  if (node.id === 'fold-yo') { state.settings.foldYo = node.checked; save(); }
  if (node.id === 'vocab-lesson') renderVocab();
  if (node.id === 'book-track') { $('#book-audio').pause(); $('#book-audio').src = node.value; $('#book-audio-status').textContent = 'Tap Play. The textbook questions are in the PDF; the nearby typed questions belong to this app\'s supplementary passage.'; }
  if (node.id === 'book-loop') $('#book-audio').loop = node.checked;
  if (node.id === 'backup-file' && node.files[0]) {
    try { if (node.files[0].size > 1024*1024) throw new Error('The file is too large (maximum 1 MB).'); const data = JSON.parse(await node.files[0].text()); if (!validateBackup(data, lessons.map(l => l.id))) throw new Error('This backup has an invalid structure. Your current data is unchanged.'); pendingBackup={version:1,progress:data.progress,drafts:data.drafts,setResults:data.setResults||{},activity:data.activity||[],settings:{rate:Number(data.settings.rate),foldYo:data.settings.foldYo}};
      openDialog({title:'Restore your learning progress?',subtitle:'This will replace your current local data with the backup.',body:'<p>This valid backup contains '+Object.keys(data.progress).length+' skill results and '+Object.keys(data.drafts).length+' drafts. You can cancel and export your current data before restoring.</p>',footer:'<button class="btn secondary" data-action="close-dialog">Keep current data</button><button class="btn coral" data-action="confirm-restore">Restore backup</button>'}); }
    catch (error) { toast(error.message); node.value = ''; }
  }
});
document.addEventListener('click', async event => {
  if (event.target.closest('#skip-link')) { event.preventDefault(); $('#main').focus(); return; }
  const button = event.target.closest('[data-action]'); if (!button) return;
  const action = button.dataset.action;
  if (action === 'listen') { $('#book-audio')?.pause(); const text = route.skill === 'speaking' ? route.lesson.speaking[phraseIndex].text : getExercise(route.lesson,route.skill,route.bank).text; audio.speak(text, state.settings.rate, () => $('#player')?.classList.remove('playing')); }
  if (action === 'stop-audio') { audio.stopSpeech(); $('#player')?.classList.remove('playing'); setAudioStatus('Stopped. Tap Listen to start again.'); }
  if (action === 'word') audio.speak(button.dataset.word, state.settings.rate);
  if (action === 'test-voice') audio.speak('Здравствуйте! Я изучаю русский язык.', state.settings.rate);
  if (action === 'retry') { getExercise(route.lesson,route.skill,route.bank).questions.forEach((q,i) => { delete state.drafts[draftKey(route.lesson.id,route.skill,route.bank,i)]; }); save(); render(); $('#answer-0').focus(); }
  if (action === 'phrase') { phraseIndex = Number(button.dataset.index); render(); $(`[data-action="phrase"][data-index="${phraseIndex}"]`).focus({preventScroll:true}); }
  if (action === 'recognize') {
    if (audio.recognition) { audio.stopRecognition(); return; }
    const started = audio.recognize((final, interim) => { const node = $('#speech-text'); if (node) node.textContent = `${final} ${interim}`.trim(); }, final => { button.classList.remove('recording'); button.setAttribute('aria-label','Start speech recognition'); if ($('#mic-label')) $('#mic-label').textContent = 'Tap to try again'; if (final) showSpeechResult(final); });
    if (started) { $('#speech-score').textContent = ''; button.classList.add('recording'); button.setAttribute('aria-label','Stop recognition'); $('#mic-label').textContent = 'Listening · Tap to stop'; }
  }
  if (action === 'record') {
    if (audio.recorder?.state === 'recording') { audio.stopRecord(); return; }
    button.disabled = true; const activeAudio = audio; recordingBlob = null; controller?.abort(); $('#online-transcription').hidden = true; $('#recording-preview audio')?.pause();
    const started = await activeAudio.record((blob,url) => { recordingBlob = blob; $('#recording-preview').innerHTML = '<audio controls playsinline aria-label="Play your recording"></audio>'; $('#recording-preview audio').src = url; $('#online-transcription').hidden = !caps.transcription; }, () => { if (button.isConnected) { button.innerHTML = `${icon('mic')} Record again`; button.classList.remove('recording'); } });
    if (button.isConnected) { button.disabled = false; if (started) { button.innerHTML = `${icon('stop')} Stop recording`; button.classList.add('recording'); } }
  }
  if (action === 'transcribe') await transcribe();
  if (action === 'writing-check') await checkWriting();
  if (action === 'replace') { const node = $('#writing-text'), result = $('#writing-result'); if (node.value !== result.dataset.snapshot) { toast('Your writing has changed. Check it again before applying suggestions.'); return; } const start = Number(button.dataset.offset), length = Number(button.dataset.length); node.value = node.value.slice(0,start) + button.dataset.replacement + node.value.slice(start+length); node.dispatchEvent(new Event('input',{bubbles:true})); node.focus(); toast('One correction applied. Check again to update the remaining suggestions.','success'); }
  if (action === 'export') { if(runtime()?.exportBackup){try{await runtime().exportBackup(JSON.stringify(state,null,2),`russian-kitty-${localDate()}.json`);}catch{toast('Backup export failed. Please try again.');}return;} const blob = new Blob([JSON.stringify(state,null,2)],{type:'application/json'}), url = URL.createObjectURL(blob), anchor = document.createElement('a'); anchor.href = url; anchor.download = `nga-ngo-a1-${localDate()}.json`; anchor.click(); setTimeout(() => URL.revokeObjectURL(url),3000); }
  if(action==='reset')openDialog({title:'Delete local data?',subtitle:'This will delete drafts and progress on this device.',body:'<p>Export a backup first to keep your learning progress. Your PDF and downloaded backup files will not be deleted.</p>',footer:'<button class="btn secondary" data-action="close-dialog">Keep my data</button><button class="btn danger" data-action="confirm-reset">Delete drafts and progress</button>'});
  if(action==='confirm-reset'){closeDialog();state=defaults();save();render();toast('Local drafts and progress deleted.','success');}
  if(action==='confirm-restore'&&pendingBackup){state=pendingBackup;pendingBackup=null;closeDialog();save();render();toast('Drafts and progress restored.','success');}
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
    save();$('#exercise-result').textContent='';wrong[0]?.focus();toast('Correct answers are kept. Fill in only the answers you missed.');
  }
});
window.addEventListener('hashchange', () => { phraseIndex = 0; render(true); });
window.addEventListener('pagehide', () => audio?.dispose());
window.addEventListener('pageshow', event => { if (event.persisted) render(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) { audio?.stopRecognition(); audio?.stopRecord(); audio?.stopSpeech(); $('#player')?.classList.remove('playing'); } });
function updateConnection() { $('#connection').textContent = navigator.onLine ? 'Ready to learn' : 'Offline'; }
window.addEventListener('online',updateConnection); window.addEventListener('offline',updateConnection);

initializeDialogs();
render(); updateConnection(); if (localIssue) toast(localIssue);
apiFetch('/api/capabilities').then(r => r.ok ? r.json() : Promise.reject()).then(data => { caps = data; updateCapabilities(); }).catch(() => { updateCapabilities(); });
// Keep local development reloads fresh; deployed HTTPS apps cache the PWA shell.
if (!isInstalled() && 'serviceWorker' in navigator && window.isSecureContext && !['localhost','127.0.0.1','[::1]'].includes(location.hostname)) navigator.serviceWorker.register('/sw.js').catch(() => {});
