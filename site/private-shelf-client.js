const prefix='/local-private/dating/';
const pendingKey='spike-private-shelf-lock-pending',pendingMessage='本页内容已隐藏，但服务端会话尚未确认结束。请重试上锁，或输入密码重新解锁。';
let pendingMemory=false;
let epochMemory='';const epochKey='spike-private-shelf-lock-epoch';
function lockEpoch(){try{return localStorage.getItem(epochKey)||'';}catch{return epochMemory;}}
function pendingLock(){try{return localStorage.getItem(pendingKey)==='1';}catch{return pendingMemory;}}
function setPending(value){pendingMemory=value;try{if(value)localStorage.setItem(pendingKey,'1');else localStorage.removeItem(pendingKey);}catch{}}
export async function privateShelfRequest(route,options={}){
 const epoch=lockEpoch();
 if(pendingLock()&&!(route==='session'&&['POST','DELETE'].includes(options.method)))throw Error(pendingMessage);
 const response=await fetch(prefix+route,{credentials:'same-origin',cache:'no-store',...options,headers:{...(options.body?{'content-type':'application/json'}:{}),...options.headers},body:options.body?JSON.stringify(options.body):undefined});
 let data;try{data=await response.json();}catch{data={error:'约会书架需要本地受保护服务，请打开本地预览。'};}
 if(!response.ok){const error=Error(data.error||'书架暂时无法打开。');error.status=response.status;throw error;}
 if(options.method!=='DELETE'&&epoch!==lockEpoch())throw Error('书架已重新上锁，请重新输入密码。');
 return data;
}
export function mountPrivateShelfGate(container,onUnlocked,message=''){
 container.innerHTML='<section class="private-shelf-gate"><div class="private-shelf-lock" aria-hidden="true">⌑</div><p class="kicker">PRIVATE READING / 约会</p><h2>解锁约会书架</h2><p>输入密码后，才能查看这个分类里的书目、封面和 PDF。</p><form class="private-shelf-form"><label for="private-shelf-password">书架密码</label><div><input id="private-shelf-password" type="password" autocomplete="current-password" maxlength="256" required><button type="submit">解锁书架</button></div><p class="private-shelf-error" role="alert"></p></form></section>';
 const form=container.querySelector('form'),input=container.querySelector('input'),error=container.querySelector('[role=alert]'),button=container.querySelector('button');
 error.textContent=pendingLock()?pendingMessage:message;
 if(pendingLock()){
  const retry=document.createElement('button');retry.type='button';retry.textContent='重试上锁';retry.className='private-shelf-retry';form.append(retry);
  retry.addEventListener('click',async()=>{retry.disabled=true;try{await lockPrivateShelf();retry.remove();error.textContent='已结束会话，书架已上锁。';}catch{error.textContent=pendingMessage;retry.disabled=false;}});
 }
 form.addEventListener('submit',async event=>{
  event.preventDefault();button.disabled=true;error.textContent='';
  try{await privateShelfRequest('session',{method:'POST',body:{password:input.value}});input.value='';if(form.isConnected){setPending(false);await onUnlocked();}}
  catch(problem){input.value='';error.textContent=problem.message;input.focus();}
  finally{button.disabled=false;}
 });
}
export async function lockPrivateShelf(){
 const epoch=crypto.randomUUID();epochMemory=epoch;try{localStorage.setItem(epochKey,epoch);}catch{}
 setPending(true);
 const notify=()=>{if('BroadcastChannel'in window){const channel=new BroadcastChannel('spike-private-shelf');channel.postMessage('locked');channel.close();}};
 notify();
 await privateShelfRequest('session',{method:'DELETE'});if(epoch===lockEpoch())setPending(false);
 notify();
}
export function watchPrivateShelf(onLocked){
 let disposed=false,checking=false;
 const check=async()=>{if(disposed||checking||document.hidden)return;checking=true;try{const state=await privateShelfRequest('session');if(!state.unlocked&&!disposed)onLocked();}catch{if(!disposed)onLocked();}finally{checking=false;}};
 const channel='BroadcastChannel'in window?new BroadcastChannel('spike-private-shelf'):null;
 if(channel)channel.onmessage=event=>{if(event.data==='locked'&&!disposed)onLocked();};
 const interval=setInterval(check,15000);addEventListener('focus',check);addEventListener('pageshow',check);document.addEventListener('visibilitychange',check);
 return()=>{disposed=true;clearInterval(interval);channel?.close();removeEventListener('focus',check);removeEventListener('pageshow',check);document.removeEventListener('visibilitychange',check);};
}
