// Fixed-provider adapter shared by iOS and Windows. No arbitrary proxy URLs.
export function createProviders(send) {
  const clips=new Map();let clipBytes=0;
  return async function request(path, body) {
    try {
      if(path==='/api/tts') {
        const text=body?.text?.normalize('NFC').replace(/\u0301/g,'').trim();
        if(!text||text.length>180)return {status:400,data:{error:'Mỗi đoạn giọng đọc cần từ 1 đến 180 ký tự.'}};
        if(clips.has(text))return {status:200,data:{audio:clips.get(text),provider:'Google Translate'}};
        const url='https://translate.google.com/translate_tts?ie=UTF-8&tl=ru&client=tw-ob&q='+encodeURIComponent(text);
        const response=await send(url,{method:'GET',binary:true});
        if(response.status!==200||!response.data||!response.contentType?.startsWith('audio/'))return {status:502,data:{error:'Google Translate hiện chưa trả được giọng Nga. Hãy kiểm tra mạng và thử lại sau.'}};
        if(response.data.length>1500000)throw new Error('Audio exceeds limit');
        clips.set(text,response.data);clipBytes+=response.data.length*2;
        while(clipBytes>12*1024*1024||clips.size>150){const oldest=clips.keys().next().value;clipBytes-=clips.get(oldest).length*2;clips.delete(oldest);}
        return {status:200,data:{audio:response.data,provider:'Google Translate'}};
      }
      if(path==='/api/writing/check') {
        if(!body?.consent)return {status:400,data:{error:'Cần đồng ý gửi bài viết đến LanguageTool.'}};
        if(typeof body.text!=='string'||!body.text.trim()||body.text.length>5000)return {status:400,data:{error:'Bài viết cần từ 1 đến 5.000 ký tự.'}};
        const response=await send('https://api.languagetool.org/v2/check',{method:'POST',body:new URLSearchParams({text:body.text,language:'ru'}).toString()});
        if(response.status!==200)return {status:response.status===429?429:502,data:{error:response.status===429?'Dịch vụ đang giới hạn lượt kiểm tra. Hãy đợi một phút.':'Dịch vụ kiểm tra hiện chưa sẵn sàng. Bản nháp được giữ trên thiết bị.'}};
        const source=typeof response.data==='string'?JSON.parse(response.data):response.data;
        if(!Array.isArray(source.matches))throw new Error('Invalid provider response');
        return {status:200,data:{provider:'LanguageTool',matches:source.matches.map(m=>({message:m.message,offset:m.offset,length:m.length,replacements:m.replacements.slice(0,5).map(r=>r.value),rule:m.rule.id}))}};
      }
      return {status:404,data:{error:'Chức năng này chưa được bật trong ứng dụng.'}};
    }catch {return {status:502,data:{error:'Chưa kết nối được dịch vụ online. Kiểm tra Internet rồi thử lại; bản nháp vẫn được giữ.'}};}
  };
}
