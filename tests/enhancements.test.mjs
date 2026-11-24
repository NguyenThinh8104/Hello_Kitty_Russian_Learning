import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile,access } from 'node:fs/promises';
import { lessons } from '../NgaNgo.Web/wwwroot/js/content.js';
import { vocabulary } from '../NgaNgo.Web/wwwroot/js/vocabulary-data.js';
import { wordArt } from '../NgaNgo.Web/wwwroot/js/vocabulary-art.js';
import { grammarUnits } from '../NgaNgo.Web/wwwroot/js/grammar-content.js';
import { speakingTopics,topicForLesson } from '../NgaNgo.Web/wwwroot/js/speaking-topics.js';
import { checkReadingAnswer } from '../NgaNgo.Web/wwwroot/js/reading-bank.js';
import { normalize,validateBackup } from '../NgaNgo.Web/wwwroot/js/practice.js';
import { pcmWave } from '../NgaNgo.Web/wwwroot/js/seekable-audio.js';
import { reviewRussianMatches } from '../NgaNgo.Web/wwwroot/js/russian-feedback.js';
test('all transcribed glossary entries have bilingual cards, usable stress marks and local illustrations',async()=>{
 const source=JSON.parse(await readFile(new URL('../scripts/vocabulary-source.json',import.meta.url),'utf8'));
 assert.ok(vocabulary.length>=800);assert.ok(new Set(vocabulary.map(w=>w.word)).size>=700);
 assert.equal(new Set(vocabulary.map(w=>w.id)).size,vocabulary.length);
 for(const[lesson,words]of Object.entries(source))assert.deepEqual(vocabulary.filter(w=>w.lesson===lesson).map(w=>w.word),[...new Set(words.split('|'))]);
 const images=new Set();
 for(const w of vocabulary){
  assert.equal(normalize(w.ru),normalize(w.word),w.word);assert.ok(w.en&&w.vi,w.word);assert.ok(!/[А-Яа-яЁё]/.test(w.vi),w.word);
  assert.ok(!/(?:^|\s)\u0301/u.test(w.ru),w.word);
  for(const part of w.ru.split(/[\s-]+/)){if((part.match(/[аеёиоуыэюя]/giu)||[]).length>1)assert.ok(part.includes('\u0301')||/ё/i.test(part),w.word);}
  images.add(wordArt(w.word,w.lesson).src);
 }
 for(const image of images)await access(new URL('../NgaNgo.Web/wwwroot/'+image,import.meta.url));
 assert.equal(vocabulary.find(w=>w.word==='помочь').ru,'помо́чь');
 assert.equal(vocabulary.find(w=>w.word==='рок').en,'rock music');
 assert.equal(vocabulary.find(w=>w.word==='голубой').en,'light blue');
});
test('126 reading questions require full sentences, accept pronoun variants and reject missing-word answers',()=>{
 let count=0;for(const lesson of lessons)for(const set of lesson.readingSets)for(const q of set.questions){
  count++;assert.ok(q.prompt.endsWith('?'));assert.ok(!q.prompt.includes('___'));
  for(const answer of q.answers)assert.ok(checkReadingAnswer(answer,q.answers));
  for(const short of q.shortAnswers)assert.ok(!checkReadingAnswer(short,q.answers));
  assert.ok(!checkReadingAnswer('не '+q.answers[0],q.answers));
 }
 assert.equal(count,126);const first=lessons[0].readingSets[0];assert.ok(checkReadingAnswer('Она студентка!',first.questions[2].answers));
 assert.ok(!checkReadingAnswer('Он из Вьетнам.',first.questions[0].answers));
});
test('grammar has 14 aligned units and 42 answer-bearing exercises',()=>{
 assert.deepEqual(Object.keys(grammarUnits),lessons.map(l=>l.id));let count=0;
 for(const unit of Object.values(grammarUnits)){assert.ok(unit.sections.every(s=>s.rule.en&&s.rule.vi&&s.examples.length));for(const q of unit.practice){count++;assert.ok(q.answers.length&&q.explanation.en&&q.explanation.vi);assert.ok(!q.answers.some(a=>/[A-Za-z]/.test(a)));}}
 assert.equal(count,42);
});
test('eight document speaking topics map every textbook lesson to an original Russian monologue',()=>{
 assert.deepEqual(speakingTopics.map(t=>t.title),['Расскажите о себе.','Расскажите о вашей семье.','Расскажите о вашем хобби.','Расскажите о вашем городе.','Расскажите о вашем дне.','Расскажите о вашем доме/ вашей квартире.','Расскажите о вашем университете.','Расскажите о вашем любимом празднике.']);
 for(const lesson of lessons)assert.ok(topicForLesson(lesson.id).lessonIds.includes(lesson.id));
 for(const topic of speakingTopics){assert.ok(topic.questions.length>=5);assert.ok(!/[A-Za-z]/.test(topic.sample));assert.ok(topic.en&&topic.vi);}
});
test('new topic drafts and grammar progress round-trip while old backups stay valid',()=>{
 const ids=lessons.map(l=>l.id),data={version:1,progress:{},drafts:{},settings:{rate:.85,foldYo:false}};assert.ok(validateBackup(data,ids));
 data.topicDrafts={myself:'Меня зовут Анна.'};data.grammarResults={hello:{best:100,date:'2026-11-24'}};assert.ok(validateBackup(JSON.parse(JSON.stringify(data)),ids));
 data.grammarResults.hello.best=101;assert.ok(!validateBackup(data,ids));data.grammarResults.hello.best=100;data.topicDrafts.unknown='bad';assert.ok(!validateBackup(data,ids));
});
test('seekable audio has a valid PCM WAV header and clamped samples',async()=>{
 const blob=pcmWave([new Float32Array([-2,0,2]),new Float32Array([.5])],24000),view=new DataView(await blob.arrayBuffer());
 assert.equal(blob.size,52);assert.equal(view.getUint32(24,true),24000);assert.equal(view.getUint32(40,true),8);assert.equal(view.getInt16(44,true),-32768);assert.equal(view.getInt16(48,true),32767);
});
test('reviewed suggestions repair common conjugation and preserve proper-place capitalization',()=>{
 const matches=reviewRussianMatches('Я живёт в Москва.',[{offset:0,length:7,message:'Неверное спряжение глагола',replacements:[]},{offset:8,length:8,message:'Проверьте падеж',replacements:['в москве','в москву']}]);
 assert.deepEqual(matches[0].replacements,['Я живу']);assert.deepEqual(matches[1].replacements,['в Москве','в Москву']);
 assert.deepEqual(reviewRussianMatches('Я живёт.',[{offset:0,length:7,message:'Other rule',replacements:[]}])[0].replacements,[]);
});
