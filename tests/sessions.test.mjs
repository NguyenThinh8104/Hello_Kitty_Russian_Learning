import test from 'node:test';
import assert from 'node:assert/strict';
import { lessons } from '../NgaNgo.Web/wwwroot/js/content.js';
import { draftKey, setResult, recordResult, practicedSets, exerciseTotals } from '../NgaNgo.Web/wwwroot/js/sessions.js';
import { validateBackup } from '../NgaNgo.Web/wwwroot/js/practice.js';
const blank=()=>({version:1,progress:{},drafts:{},setResults:{},activity:[],settings:{rate:.85,foldYo:false}});
test('126 listening + 126 reading questions, 84 speaking phrases, 42 writing prompts',()=>{
 assert.deepEqual(exerciseTotals(lessons),{listening:126,reading:126,speaking:84,writing:42});
 const passages=lessons.flatMap(l=>[...l.listeningSets,...l.readingSets].map(s=>s.text));
 assert.equal(new Set(passages).size,84,'each reading/listening passage is distinct');
});
test('a first attempt on set 2 does not incorrectly mark set 1 as practiced',()=>{
 const state=blank();recordResult(state,'hello','reading','practice',67,'2026-11-24');
 assert.equal(setResult(state,'hello','reading','core'),undefined);
 assert.equal(setResult(state,'hello','reading','practice').best,67);
 assert.equal(practicedSets(state,lessons[0],'reading'),1);
 recordResult(state,'hello','reading','core',33,'2026-11-24');
 assert.equal(setResult(state,'hello','reading','core').best,33);
});
test('legacy progress migrates to core when a new set is attempted',()=>{
 const state=blank();delete state.setResults;state.progress['hello:reading']={best:100,date:'2026-11-23'};
 assert.equal(practicedSets(state,lessons[0],'reading'),1);
 recordResult(state,'hello','reading','practice',33,'2026-11-24');
 assert.equal(practicedSets(state,lessons[0],'reading'),2);
 assert.equal(setResult(state,'hello','reading','core').best,100);
 assert.equal(setResult(state,'hello','reading','practice').best,33);
});
test('each set keeps its own best score and history without counting retries twice',()=>{
 const state=blank();
 recordResult(state,'hello','listening','challenge',100,'2026-11-23');
 recordResult(state,'hello','listening','challenge',33,'2026-11-24');
 assert.equal(setResult(state,'hello','listening','challenge').best,100);
 assert.equal(practicedSets(state,lessons[0],'listening'),1);
 assert.deepEqual(state.activity,['2026-11-23','2026-11-24']);
});
test('core draft keys remain compatible while new sets remain isolated and exportable',()=>{
 const state=blank(),ids=lessons.map(l=>l.id);
 assert.equal(draftKey('hello','writing','core'),'hello:writing');
 assert.equal(draftKey('hello','reading','core',2),'hello:reading:2');
 state.drafts[draftKey('hello','writing','practice')]='Это наш класс.';
 state.drafts[draftKey('hello','reading','challenge',0)]='Анна';
 recordResult(state,'hello','writing','practice',0,'2026-11-24');
 assert.ok(validateBackup(state,ids));
 assert.notEqual(draftKey('hello','reading','core',0),draftKey('hello','reading','practice',0));
 state.setResults['hello:reading:unknown']={best:100,date:'2026-11-24'};
 assert.ok(!validateBackup(state,ids));
});
