import test from 'node:test';
import assert from 'node:assert/strict';
import { normalize, isCorrect, speechComparison, wordCount, validateBackup } from '../NgaNgo.Web/wwwroot/js/practice.js';
import { lessons, alphabet } from '../NgaNgo.Web/wwwroot/js/content.js';

test('Cyrillic grading tolerates case, stress and punctuation, but preserves endings', () => {
  assert.equal(normalize('  МОСКВЕ! '),'москве');
  assert.ok(isCorrect('Росси́и.', ['России']));
  assert.ok(!isCorrect('Россия', ['России']));
  assert.ok(!isCorrect('Mоскве', ['Москве'])); // Latin M cannot impersonate Cyrillic М.
  assert.ok(!isCorrect('', ['']));
});
test('ё has an explicit strict/lenient policy', () => {
  assert.ok(!isCorrect('все', ['всё']));
  assert.ok(isCorrect('все', ['всё'], true));
  assert.equal(normalize('Ёлка'),'ёлка');
  assert.equal(normalize('е\u0308лка'),'ёлка');
});
test('speech word alignment penalizes omissions and insertions, with no false perfect score', () => {
  assert.equal(speechComparison('Я учусь в университете.', 'я учусь в университете'),100);
  assert.equal(speechComparison('Я учусь в университете.', ''),0);
  assert.equal(speechComparison('Я учусь в университете.', 'Я учусь'),50);
  assert.ok(speechComparison('Я учусь.', 'Я учусь в школе') < 100);
  assert.equal(speechComparison('Я живу здесь.', 'я не живу здесь'),75);
});
test('word count handles Cyrillic, hyphens and punctuation', () => {
  assert.equal(wordCount('Я говорю по-русски. А ты?'),5);
  assert.equal(wordCount('  ...  '),0);
});
test('the 2017 curriculum contains 14 unique, complete chapters and 33 letters', () => {
  assert.equal(lessons.length,14); assert.equal(new Set(lessons.map(l=>l.id)).size,14);
  assert.equal(alphabet.length,33);
  assert.deepEqual(lessons.map(l=>l.number),Array.from({length:14},(_,i)=>i+1));
  assert.equal(lessons[5].title,'Что вы делали вчера?');
  assert.equal(lessons[13].pages,'176–185');
  for (const lesson of lessons) {
    for (const skill of ['listening','reading']) for(const exercise of lesson[`${skill}Sets`]) {
      assert.equal(lesson[`${skill}Sets`].length,3,lesson.id);
      assert.equal(exercise.questions.length,3,lesson.id);
      assert.ok(!/[A-Za-z]/.test(exercise.text),`Latin in Russian text: ${lesson.id}`);
      for (const question of exercise.questions) {
        assert.ok(question.answers.every(a=>!/[A-Za-z]/.test(a)));
        assert.ok(question.answers.some(a=>normalize(exercise.text).includes(normalize(a))),`Answer missing from passage: ${lesson.id} ${exercise.id} ${question.prompt}`);
      }
    }
    assert.equal(lesson.speaking.length,6);
    for (const phrase of lesson.speaking) assert.ok(!/[A-Za-z]/.test(phrase.text));
    assert.equal(lesson.writingSets.length,3);
    for(const task of lesson.writingSets){
      assert.ok(wordCount(task.sample)>=task.min,`Sample too short: ${lesson.id} ${task.id}`);
      assert.ok(wordCount(task.sample)<=task.max,`Sample too long: ${lesson.id} ${task.id}`);
      assert.ok(!/[A-Za-z]/.test(task.sample));
    }
    assert.equal(lesson.vocab.length,8);
  }
});
test('backup validation rejects corrupt grades and foreign lesson keys before replacement', () => {
  const valid=()=>({version:1,progress:{'hello:reading':{best:67,date:'2026-11-24'}},drafts:{'hello:writing':'Привет!'},activity:['2026-11-24'],settings:{rate:.85,foldYo:false}});
  const ids=lessons.map(l=>l.id);
  assert.ok(validateBackup(valid(),ids));
  let data=valid(); data.progress['hello:reading'].best=101; assert.ok(!validateBackup(data,ids));
  data=valid(); data.drafts['foreign:writing']='text'; assert.ok(!validateBackup(data,ids));
  data=valid(); data.activity='yesterday'; assert.ok(!validateBackup(data,ids));
  data=valid(); data.settings=null; assert.ok(!validateBackup(data,ids));
  data=valid(); data.progress['hello:reading:extra']={best:100,date:'2026-11-24'}; assert.ok(!validateBackup(data,ids));
  data=valid(); data.drafts['hello:anything']='text'; assert.ok(!validateBackup(data,ids));
  assert.ok(!validateBackup([],ids));
});
