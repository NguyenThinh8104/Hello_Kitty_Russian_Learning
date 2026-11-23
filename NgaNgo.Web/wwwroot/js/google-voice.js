import { apiFetch } from './platform.js';
export function splitSpeech(text, limit=180) {
  const words=String(text).normalize('NFC').replace(/\u0301/g,'').trim().split(/\s+/).filter(Boolean);
  const parts=[]; let current='';
  for(const word of words) {
    // Cyrillic words are short; still bound every request for arbitrary imported text.
    if(word.length>limit) { if(current)parts.push(current);current='';for(let i=0;i<word.length;i+=limit)parts.push(word.slice(i,i+limit));continue; }
    if(current && (current.length+word.length+1>limit || /[.!?…]$/.test(current))) {parts.push(current);current='';}
    current+=(current?' ':'')+word;
  }
  if(current)parts.push(current);return parts;
}
const cache=new Map();
export async function googleClip(text, signal) {
  if(signal?.aborted)throw new DOMException('Canceled','AbortError');
  if(cache.has(text))return cache.get(text);
  const response=await apiFetch('/api/tts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text}),signal});
  const data=await response.json();
  if(!response.ok)throw new Error(data.error||'Google Translate audio is unavailable. Please try again later.');
  const blob=new Blob([Uint8Array.from(atob(data.audio),c=>c.charCodeAt(0))],{type:'audio/mpeg'});
  if(!blob.size)throw new Error('Google Translate returned no audio.');
  cache.set(text,blob);if(cache.size>100)cache.delete(cache.keys().next().value);return blob;
}
