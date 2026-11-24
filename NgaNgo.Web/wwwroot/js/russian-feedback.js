// Reviewed A1 supplements to service suggestions; never rewrite a learner's text automatically.
const paradigms=[
 ['живу','живёшь','живёт','живём','живёте','живут'],['учусь','учишься','учится','учимся','учитесь','учатся'],
 ['работаю','работаешь','работает','работаем','работаете','работают'],['читаю','читаешь','читает','читаем','читаете','читают'],
 ['изучаю','изучаешь','изучает','изучаем','изучаете','изучают'],['говорю','говоришь','говорит','говорим','говорите','говорят'],
 ['люблю','любишь','любит','любим','любите','любят'],['иду','идёшь','идёт','идём','идёте','идут'],
 ['еду','едешь','едет','едем','едете','едут']
];
const fold=value=>value.toLowerCase().replace(/ё/g,'е');
export function reviewRussianMatches(text,matches){
 return matches.map(match=>{
  const m={...match,replacements:[...(match.replacements||[])]},span=text.slice(m.offset,m.offset+m.length);
  // LanguageTool sometimes returns lower-case proper place names in its alternatives.
  m.replacements=m.replacements.map(r=>r.replace(/(?<!\p{L})(?:москв[аеуы]|москвой|росси[яию]|россии|вьетнам[аеу]?|ханое|ханой)(?!\p{L})/giu,word=>word[0].toUpperCase()+word.slice(1)));
  if(!m.replacements.length&&/спряжени|местоимени/i.test(m.message)){
   const words=span.trim().split(/\s+/),pronouns=['я','ты','он','мы','вы','они'];let index=pronouns.indexOf(words[0]?.toLowerCase());if(words[0]?.toLowerCase()==='она'||words[0]?.toLowerCase()==='оно')index=2;
   if(words.length===2&&index>=0){const forms=paradigms.find(row=>row.some(v=>fold(v)===fold(words[1])));if(forms&&fold(forms[index])!==fold(words[1]))m.replacements.push(`${words[0]} ${forms[index]}`);}
  }
  return m;
 });
}
