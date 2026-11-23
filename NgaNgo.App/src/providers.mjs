// Fixed-provider adapter shared by iOS and Windows. No arbitrary proxy URLs.
export function createProviders(send) {
  const clips=new Map();let clipBytes=0;
  return async function request(path, body) {
    try {
      if(path==='/api/tts') {
        const text=body?.text?.normalize('NFC').replace(/\u0301/g,'').trim();
        if(!text||text.length>180)return {status:400,data:{error:'Each audio segment must contain 1–180 characters.'}};
        if(clips.has(text))return {status:200,data:{audio:clips.get(text),provider:'Google Translate'}};
        const url='https://translate.google.com/translate_tts?ie=UTF-8&tl=ru&client=tw-ob&q='+encodeURIComponent(text);
        const response=await send(url,{method:'GET',binary:true});
        if(response.status!==200||!response.data||!response.contentType?.startsWith('audio/'))return {status:502,data:{error:'Google Translate audio is unavailable. Check your connection and try again later.'}};
        if(response.data.length>1500000)throw new Error('Audio exceeds limit');
        clips.set(text,response.data);clipBytes+=response.data.length*2;
        while(clipBytes>12*1024*1024||clips.size>150){const oldest=clips.keys().next().value;clipBytes-=clips.get(oldest).length*2;clips.delete(oldest);}
        return {status:200,data:{audio:response.data,provider:'Google Translate'}};
      }
      if(path==='/api/writing/check') {
        if(!body?.consent)return {status:400,data:{error:'Agree to send your writing to LanguageTool first.'}};
        if(typeof body.text!=='string'||!body.text.trim()||body.text.length>5000)return {status:400,data:{error:'Your writing must contain 1–5,000 characters.'}};
        const response=await send('https://api.languagetool.org/v2/check',{method:'POST',body:new URLSearchParams({text:body.text,language:'ru'}).toString()});
        if(response.status!==200)return {status:response.status===429?429:502,data:{error:response.status===429?'The service has reached its request limit. Wait a minute and retry.':'The writing service is unavailable. Your draft is still saved on this device.'}};
        const source=typeof response.data==='string'?JSON.parse(response.data):response.data;
        if(!Array.isArray(source.matches))throw new Error('Invalid provider response');
        return {status:200,data:{provider:'LanguageTool',matches:source.matches.map(m=>({message:m.message,offset:m.offset,length:m.length,replacements:m.replacements.slice(0,5).map(r=>r.value),rule:m.rule.id}))}};
      }
      return {status:404,data:{error:'This feature is unavailable in this app.'}};
    }catch {return {status:502,data:{error:'Could not reach the online service. Check your connection and retry; your draft is saved.'}};}
  };
}
