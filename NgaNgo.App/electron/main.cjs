const {app,BrowserWindow,protocol,net,ipcMain,session,shell,dialog}=require('electron');
const path=require('node:path');
const fs=require('node:fs/promises');
const {pathToFileURL}=require('node:url');
const origin='app://russian-kitty';
const assets=path.resolve(__dirname,'../dist');
protocol.registerSchemesAsPrivileged([{scheme:'app',privileges:{standard:true,secure:true,supportFetchAPI:true,stream:true,corsEnabled:true}}]);
app.setName('Aymi Russian');
// Retain the existing data directory and app:// origin when upgrading.
app.setPath('userData',path.join(app.getPath('appData'),'Russian Kitty'));
let main;
const trusted=event=>event.sender===main?.webContents&&event.senderFrame?.url.startsWith(origin+'/');
app.whenReady().then(async()=>{
  const {createProviders}=await import('../src/providers.mjs');
  const providers=createProviders(async(url,options)=>{
    const response=await net.fetch(url,{method:options.method,headers:options.body?{'Content-Type':'application/x-www-form-urlencoded'}:{},body:options.body,signal:AbortSignal.timeout(25000)});
    return {status:response.status,contentType:response.headers.get('content-type'),data:options.binary?Buffer.from(await response.arrayBuffer()).toString('base64'):await response.text()};
  });
  const info=JSON.parse(await fs.readFile(path.join(assets,'bundle-info.json'),'utf8'));
  protocol.handle('app',async request=>{
    const url=new URL(request.url);
    if(url.host!=='russian-kitty')return new Response('Not found',{status:404});
    const target=path.resolve(assets,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
    if(target!==assets&&!target.startsWith(assets+path.sep))return new Response('Forbidden',{status:403});
    const response=await net.fetch(pathToFileURL(target).toString());
    const headers=new Headers(response.headers);
    headers.set('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; media-src 'self' blob: https://resources.lidenz.ru; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-src 'self'");
    return new Response(response.body,{status:response.status,headers});
  });
  session.defaultSession.setPermissionRequestHandler((contents,permission,callback,details)=>callback(Boolean(contents===main?.webContents&&permission==='media'&&details.requestingUrl?.startsWith(origin+'/')&&details.mediaTypes?.length&&details.mediaTypes.every(type=>type==='audio'))));
  session.defaultSession.setPermissionCheckHandler((contents,permission,requestingOrigin,details)=>contents===main?.webContents&&permission==='media'&&requestingOrigin===origin&&details.mediaType==='audio');
  ipcMain.handle('provider-request',async(event,route,body)=>{
    if(!trusted(event))throw new Error('Untrusted sender');
    if(route==='/api/capabilities')return {status:200,data:{textbook:info.textbook,transcription:false,ttsProvider:'Google Translate',writingProvider:'LanguageTool'}};
    return providers(route,body);
  });
  ipcMain.handle('open-textbook',async event=>{
    if(!trusted(event)||!info.textbook)throw new Error('Textbook unavailable');
    // Local PDF inside an application window; no external browser is needed.
    const pdf=new BrowserWindow({parent:main,title:'Aymi Russian · Textbook 2017',width:1000,height:800,autoHideMenuBar:true,webPreferences:{nodeIntegration:false,contextIsolation:true,sandbox:true}});
    pdf.webContents.setWindowOpenHandler(()=>({action:'deny'}));
    await pdf.loadURL(origin+'/textbook.pdf');
  });
  ipcMain.handle('export-backup',async(event,text,name)=>{
    if(!trusted(event)||typeof text!=='string'||text.length>1024*1024)throw new Error('Invalid backup');
    const result=await dialog.showSaveDialog(main,{title:'Save Aymi Russian backup',defaultPath:path.join(app.getPath('documents'),path.basename(String(name))),filters:[{name:'JSON',extensions:['json']}]});
    if(!result.canceled&&result.filePath)await fs.writeFile(result.filePath,text,'utf8');
  });
  main=new BrowserWindow({title:'Aymi Russian',width:1280,height:880,minWidth:390,minHeight:640,backgroundColor:'#fff6fa',autoHideMenuBar:true,icon:path.join(assets,'icons/apple-touch-icon.png'),webPreferences:{preload:path.join(__dirname,'preload.cjs'),nodeIntegration:false,contextIsolation:true,sandbox:true}});
  const external=url=>{try{const u=new URL(url);if(u.protocol==='https:'&&['languagetool.org','resources.lidenz.ru','openai.com','github.com','openrussian.org','creativecommons.org','fonts.google.com'].includes(u.hostname))void shell.openExternal(url);}catch{}};
  main.webContents.setWindowOpenHandler(({url})=>{external(url);return {action:'deny'};});
  main.webContents.on('will-navigate',(event,url)=>{if(!url.startsWith(origin+'/')){event.preventDefault();external(url);}});
  await main.loadURL(origin+'/index.html');
});
app.on('window-all-closed',()=>app.quit());
