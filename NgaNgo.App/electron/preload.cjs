const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('ngaNgoDesktop',{
  platform:'windows',
  request:(path,body)=>ipcRenderer.invoke('provider-request',path,body),
  openTextbook:()=>ipcRenderer.invoke('open-textbook'),
  exportBackup:(text,name)=>ipcRenderer.invoke('export-backup',text,name)
});
