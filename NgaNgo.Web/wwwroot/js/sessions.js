export const setIds=['core','practice','challenge'];
export function getExercises(lesson,skill){return lesson?.[`${skill}Sets`]||[];}
export function getExercise(lesson,skill,bank='core'){return getExercises(lesson,skill).find(set=>set.id===bank);}
export function draftKey(id,skill,bank='core',index){
  const prefix=bank==='core'?`${id}:${skill}`:`${id}:${skill}:${bank}`;
  return skill==='writing'?prefix:`${prefix}:${index}`;
}
export function setResult(state,id,skill,bank='core'){
  const any=Object.keys(state.setResults||{}).some(key=>key.startsWith(`${id}:${skill}:`));
  return state.setResults?.[`${id}:${skill}:${bank}`]||(bank==='core'&&!any?state.progress[`${id}:${skill}`]:undefined);
}
export function recordResult(state,id,skill,bank,score,date){
  const old=state.progress[`${id}:${skill}`];
  state.progress[`${id}:${skill}`]={best:Math.max(old?.best||0,score),date};
  if(skill!=='speaking'){
    state.setResults??={};
    const any=Object.keys(state.setResults).some(key=>key.startsWith(`${id}:${skill}:`));
    if(old&&!any)state.setResults[`${id}:${skill}:core`]={...old};
    const key=`${id}:${skill}:${bank}`;
    const previous=state.setResults[key];
    state.setResults[key]={best:Math.max(previous?.best||0,score),date};
  }
  state.activity=[...new Set([...(state.activity||[]),date])].sort().slice(-400);
}
export function practicedSets(state,lesson,skill){return getExercises(lesson,skill).filter(set=>setResult(state,lesson.id,skill,set.id)).length;}
export function exerciseTotals(lessons){
  return lessons.reduce((total,lesson)=>({
    listening:total.listening+lesson.listeningSets.reduce((n,set)=>n+set.questions.length,0),
    reading:total.reading+lesson.readingSets.reduce((n,set)=>n+set.questions.length,0),
    speaking:total.speaking+lesson.speaking.length,
    writing:total.writing+lesson.writingSets.length
  }),{listening:0,reading:0,speaking:0,writing:0});
}
