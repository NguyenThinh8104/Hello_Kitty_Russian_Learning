// Native <dialog> supplies focus trapping, Escape handling and focus restoration.
const dialog = () => document.querySelector('#app-dialog');
export function closeDialog() { if (dialog()?.open) dialog().close(); }
export function openDialog({title,subtitle='',body='',footer='',wide=false,variant='default'}) {
  const node = dialog();
  if (node.open) node.close();
  node.classList.toggle('wide',wide);
  node.dataset.variant=variant;
  node.replaceChildren();
  const header = document.createElement('header'); header.className='dialog-heading';
  const copy=document.createElement('div');
  const eyebrow=document.createElement('div'); eyebrow.className='eyebrow'; eyebrow.dataset.noI18n=''; eyebrow.textContent='AYMI RUSSIAN';
  const heading=document.createElement('h2'); heading.id='dialog-title'; heading.textContent=title;
  const detail=document.createElement('p'); detail.id='dialog-description'; detail.textContent=subtitle; detail.hidden=!subtitle;
  copy.append(eyebrow,heading,detail);
  const close=document.createElement('button'); close.className='dialog-close'; close.type='button'; close.setAttribute('aria-label','Close dialog'); close.textContent='×'; close.addEventListener('click',closeDialog);
  header.append(copy,close);
  const content=document.createElement('div'); content.className='dialog-body'; content.innerHTML=body;
  const actions=document.createElement('footer'); actions.className='dialog-footer'; actions.innerHTML=footer; actions.hidden=!footer;
  node.append(header,content,actions);
  node.showModal();
}
export function initializeDialogs() {
  const node=dialog();
  node.addEventListener('click',event=>{
    const r=node.getBoundingClientRect();
    if(event.target===node&&(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)) closeDialog();
  });
  node.addEventListener('close',()=>{if(!node.open)node.replaceChildren();});
}
