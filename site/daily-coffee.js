const key='spike-coffee-journal-v1',form=document.querySelector('#coffee-form'),list=document.querySelector('#coffee-record-list'),status=document.querySelector('#coffee-status'),editor=document.querySelector('#coffee-editor'),exportButton=document.querySelector('#coffee-export');
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let records=[],storageAvailable=true;
try{const saved=JSON.parse(localStorage.getItem(key)||'[]');if(!Array.isArray(saved))throw Error();records=saved.filter(x=>x&&typeof x.id==='string'&&typeof x.name==='string'&&typeof x.date==='string');}catch{storageAvailable=false;status.textContent='无法读取原有本机记录，请先检查浏览器存储，暂不覆盖已有数据。';form.querySelector('button[type=submit]').disabled=true;}
const today=new Date();form.elements.date.value=[today.getFullYear(),String(today.getMonth()+1).padStart(2,'0'),String(today.getDate()).padStart(2,'0')].join('-');
function render(){
 document.querySelector('#coffee-count').textContent=records.length+' 杯记录';exportButton.hidden=records.length===0;
 list.innerHTML=records.length?[...records].sort((a,b)=>b.date.localeCompare(a.date)).map(item=>{
  const details=[['产地',item.origin],['烘焙',item.roast],['冲煮',item.method],['用量',item.dose&&item.water?item.dose+' g 粉 / '+item.water+' g 水 · 1:'+(item.water/item.dose).toFixed(1):item.dose?item.dose+' g 咖啡粉':item.water?item.water+' g 注水':'']].filter(([,v])=>v);
  return '<article class="coffee-entry"><header><time datetime="'+escape(item.date)+'">'+escape(item.date)+'</time><button type="button" class="coffee-delete" data-delete="'+escape(item.id)+'" aria-label="删除'+escape(item.name)+'这条咖啡记录">删除</button></header><h3>'+escape(item.name)+'</h3>'+(details.length?'<dl>'+details.map(([k,v])=>'<dt>'+escape(k)+'</dt><dd>'+escape(v)+'</dd>').join('')+'</dl>':'')+(item.notes?'<p>'+escape(item.notes)+'</p>':'')+'</article>';
 }).join(''):'<div class="coffee-empty">还没有咖啡记录。<p>从下一杯开始，记下豆子、做法，或一句简单的感受。</p></div>';
}
function persist(next){try{if(!storageAvailable)throw Error();localStorage.setItem(key,JSON.stringify(next));records=next;render();return true;}catch{status.textContent='保存失败，请检查浏览器存储或先导出现有记录。';editor.open=true;return false;}}
form.addEventListener('submit',event=>{event.preventDefault();if(!form.reportValidity())return;const data=new FormData(form);const name=String(data.get('name')).trim();if(!name){form.elements.name.focus();return;}const item={id:crypto.randomUUID(),date:String(data.get('date')),name,origin:String(data.get('origin')).trim(),roast:String(data.get('roast')),method:String(data.get('method')),dose:Number(data.get('dose'))||null,water:Number(data.get('water'))||null,notes:String(data.get('notes')).trim()};if(persist([...records,item])){form.elements.name.value='';form.elements.notes.value='';status.textContent='已保存在当前浏览器。';}});
list.addEventListener('click',event=>{const button=event.target.closest('[data-delete]');if(button&&persist(records.filter(item=>item.id!==button.dataset.delete)))status.textContent='已删除这条本机记录。';});
document.querySelector('#coffee-start').addEventListener('click',()=>{editor.open=true;form.elements.name.focus({preventScroll:true});});
exportButton.addEventListener('click',()=>{const blob=new Blob([JSON.stringify({version:1,records},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='coffee-journal.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
render();
