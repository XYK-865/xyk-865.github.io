export function createReadingLanguage({scriptView,getContext,say,onScriptChange}){
 const $=s=>document.querySelector(s),settings=$('#translation-settings-dialog'),result=$('#translation-result-dialog');let config=null,cache={};
 try{cache=JSON.parse(localStorage.getItem('spike-reader-translations')||'{}');}catch{}
 const status=text=>{$('#translation-status').textContent=text;};
 const localService=['127.0.0.1','localhost','[::1]'].includes(location.hostname);
 const serviceMessage='当前线上阅读器支持本地简繁转换；API 翻译请在本地预览版使用。';
 if(!localService){
  $('#translation-settings-intro').textContent=serviceMessage;
  $('#reader-translation-mode').textContent='简繁转换在浏览器完成 · API 翻译需本地预览版';
  $('#translate-selection').disabled=true;$('#translate-selection').title=serviceMessage;
  $('#open-translation-settings').textContent='API 翻译说明';
  for(const el of settings.querySelectorAll('input,select,#save-translation-settings,#clear-translation-key'))el.disabled=true;
 }
 async function loadConfig(){if(!localService)throw Error(serviceMessage);const response=await fetch('/local-api/translation/config');if(!response.ok)throw Error('当前页面未连接本地翻译服务，请使用本地预览地址。');config=await response.json();return config;}
 const providerSelect=$('#translation-provider');
 function selectedConfig(){const values=config?.providers||{};return Array.isArray(values)?values.find(p=>p.id===providerSelect.value):values[providerSelect.value];}
 function fillProvider(){const p=selectedConfig()||{};$('#translation-endpoint').value=p.endpoint||'';$('#translation-model').value=p.model||'';$('#translation-key').value='';$('#translation-key').placeholder=p.hasKey?'已配置，留空继续使用':'填写该平台的 API Key';$('#translation-remember').checked=!!p.remember;$('#translation-config-status').textContent=p.hasKey?'该平台已配置密钥。':'该平台尚未配置密钥。';if(p.docs){$('#translation-provider-docs').href=p.docs;$('#translation-provider-docs').hidden=false;}else $('#translation-provider-docs').hidden=true;}
 async function openSettings(){settings.showModal();try{await loadConfig();fillProvider();}catch(error){$('#translation-config-status').textContent=error.message;}}
 providerSelect.addEventListener('change',fillProvider);$('#open-translation-settings').addEventListener('click',openSettings);
 $('#save-translation-settings').addEventListener('click',async()=>{
  const button=$('#save-translation-settings');button.disabled=true;
  try{
   await loadConfig();const response=await fetch('/local-api/translation/config',{method:'POST',headers:{'content-type':'application/json','X-Reader-Token':config.token},body:JSON.stringify({provider:providerSelect.value,endpoint:$('#translation-endpoint').value.trim(),model:$('#translation-model').value.trim(),apiKey:$('#translation-key').value.trim(),remember:$('#translation-remember').checked})});
   const data=await response.json();if(!response.ok)throw Error(data.error||'保存失败');$('#translation-key').value='';await loadConfig();fillProvider();$('#translation-config-status').textContent='已保存；选中段落后点击“译为中文”即可使用。';localStorage.setItem('spike-reader-provider',providerSelect.value);
  }catch(error){$('#translation-config-status').textContent=error.message;}finally{button.disabled=false;}
 });
 $('#clear-translation-key').addEventListener('click',async()=>{try{await loadConfig();const response=await fetch('/local-api/translation/config',{method:'DELETE',headers:{'content-type':'application/json','X-Reader-Token':config.token},body:JSON.stringify({provider:providerSelect.value})});const data=await response.json();if(!response.ok)throw Error(data.error||'清除失败');await loadConfig();fillProvider();}catch(error){$('#translation-config-status').textContent=error.message;}});
 const savedProvider=localStorage.getItem('spike-reader-provider');if(savedProvider&&[...providerSelect.options].some(o=>o.value===savedProvider))providerSelect.value=savedProvider;
 function syncButton(){$('#simplified-toggle').setAttribute('aria-pressed',String(scriptView.isSimplified()));$('#simplified-toggle').textContent=scriptView.isSimplified()?'简体 · 已开':'简体';}
 $('#simplified-toggle').addEventListener('click',()=>{
  const context=getContext();
  if(context.pdf){
   const text=context.text();if(!text.trim()){say('该页是扫描图，暂时没有可转换的文字。');return;}
   $('#translation-result-title').textContent='当前页简体文字';$('#translation-source').textContent='PDF 原排版保留原文，以下显示当前页文字的简体版本。';$('#translation-output').textContent=scriptView.convert(text);status('在本地转换，不调用 API。');result.showModal();return;
  }
  scriptView.setSimplified(!scriptView.isSimplified());syncButton();onScriptChange();say(scriptView.isSimplified()?'正文和目录已切换为简体，原文件与原文笔记保留。':'已恢复原文。');
 });
 $('#translate-selection').addEventListener('pointerdown',event=>event.preventDefault());
 $('#translate-selection').addEventListener('click',async()=>{
  const selection=getSelection(),context=getContext();let text='';
  if(selection&&!selection.isCollapsed&&selection.rangeCount&&(context.root.contains(selection.getRangeAt(0).commonAncestorContainer)||$('#translation-output').contains(selection.getRangeAt(0).commonAncestorContainer)))text=selection.toString().trim();
  if(!text){say('请先选中需要翻译的段落；扫描图片需要先识别出文字。');return;}
  if(text.length>6000){say('一次最多翻译 6000 个字符，请缩短选中的段落。');return;}
  $('#translation-result-title').textContent='中文译读';$('#translation-source').textContent=text;$('#translation-output').textContent='';status('正在准备翻译…');result.showModal();
  const button=$('#translate-selection');button.disabled=true;
  try{
   await loadConfig();const provider=localStorage.getItem('spike-reader-provider')||providerSelect.value,p=Array.isArray(config.providers)?config.providers.find(p=>p.id===provider):config.providers[provider];
   if(!p?.hasKey)throw Error('请先在“翻译设置”中填写该平台的 API Key。');
   const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(provider+'|'+p.model+'|'+p.endpoint+'|'+text)),key=[...new Uint8Array(bytes)].map(n=>n.toString(16).padStart(2,'0')).join('');
   if(cache[key]){$('#translation-output').textContent=cache[key].text;status('已显示本机缓存的译文，本次未调用 API。');return;}
   status('正在调用 '+(p.name||provider)+' · '+p.model+'；仅发送当前选中的段落。');
   const response=await fetch('/local-api/translation/translate',{method:'POST',headers:{'content-type':'application/json','X-Reader-Token':config.token},body:JSON.stringify({provider,text})});const data=await response.json();if(!response.ok)throw Error(data.error||'翻译失败');
   $('#translation-output').textContent=data.translation;status('AI 译文 · '+(p.name||provider)+' / '+data.model+(data.usage?.total_tokens?' · '+data.usage.total_tokens+' tokens':'')+'。专业术语和结论请与原文对照。');
   cache[key]={text:data.translation,at:Date.now()};const entries=Object.entries(cache).sort((a,b)=>b[1].at-a[1].at).slice(0,30);cache=Object.fromEntries(entries);try{localStorage.setItem('spike-reader-translations',JSON.stringify(cache));}catch{}
  }catch(error){status(error.message);}finally{button.disabled=false;}
 });
 syncButton();return {syncButton};
}
