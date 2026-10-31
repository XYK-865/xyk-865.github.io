const instances=new WeakMap(),NS='http://www.w3.org/2000/svg';
const colors={yellow:'#efc532',green:'#64bd81',pink:'#e47fae'};
export function createPDFRegions({content,button,tool,size,getPage,getAnnotations,onCreate,say}){
 if(instances.has(content))return instances.get(content);
 let selecting=false,drag=null;
 const clamp=n=>Math.max(0,Math.min(1,n)),currentPage=()=>content.querySelector('.pdf-page');
 const point=(event,page)=>{const r=page.getBoundingClientRect();return{x:clamp((event.clientX-r.left)/r.width),y:clamp((event.clientY-r.top)/r.height)};};
 const rectangle=(a,b)=>({x:Math.min(a.x,b.x),y:Math.min(a.y,b.y),w:Math.abs(a.x-b.x),h:Math.abs(a.y-b.y)});
 function place(el,r){Object.assign(el.style,{left:r.x*100+'%',top:r.y*100+'%',width:r.w*100+'%',height:r.h*100+'%'});}
 function svgStroke(page,points,width,color,draft=false){
  const svg=document.createElementNS(NS,'svg'),line=document.createElementNS(NS,'polyline');
  svg.setAttribute('viewBox','0 0 '+page.clientWidth+' '+page.clientHeight);svg.setAttribute('aria-hidden','true');
  svg.classList.add(draft?'pdf-brush-draft':'pdf-region-mark','pdf-brush-layer');
  line.setAttribute('fill','none');line.setAttribute('stroke',colors[color]||colors.yellow);line.setAttribute('stroke-opacity','.38');
  line.setAttribute('stroke-linecap','round');line.setAttribute('stroke-linejoin','round');line.setAttribute('stroke-width',width*page.clientWidth);
  line.setAttribute('points',points.map(p=>p.x*page.clientWidth+','+p.y*page.clientHeight).join(' '));svg.append(line);return svg;
 }
 function clearDrag(){const previous=drag;drag=null;if(previous){previous.draft.remove();if(previous.page.hasPointerCapture(previous.pointerId))previous.page.releasePointerCapture(previous.pointerId);}}
 function reset(){clearDrag();selecting=false;content.classList.remove('pdf-region-selecting');button.setAttribute('aria-pressed','false');}
 function render(){
  content.querySelectorAll('.pdf-region-mark').forEach(el=>el.remove());const page=currentPage();if(!page)return;
  for(const note of getAnnotations()||[]){
   if(note.page!==getPage())continue;let mark;
   if(note.stroke?.points?.length){mark=svgStroke(page,note.stroke.points,note.stroke.width,note.color);}
   else if(note.rect){const r=note.rect;if(![r.x,r.y,r.w,r.h].every(Number.isFinite))continue;mark=document.createElement('div');mark.className='pdf-region-mark pdf-region-'+(note.color in colors?note.color:'yellow');place(mark,{x:clamp(r.x),y:clamp(r.y),w:Math.min(clamp(r.w),1-clamp(r.x)),h:Math.min(clamp(r.h),1-clamp(r.y))});}
   if(mark){mark.dataset.annotationId=note.id;mark.setAttribute('aria-hidden','true');page.append(mark);}
  }
 }
 button.addEventListener('click',()=>{
  if(selecting){reset();return;}if(!currentPage()){say('请先打开一页 PDF。');return;}
  selecting=true;content.classList.add('pdf-region-selecting');button.setAttribute('aria-pressed','true');getSelection()?.removeAllRanges();
  say('荧光笔已开启：按住拖动涂画；可调整笔宽、切换矩形，按 Esc 或再次点击荧光笔退出。');
 });
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&selecting)reset();});
 content.addEventListener('pointerdown',event=>{
  if(!selecting||drag||!event.isPrimary||event.button!==0)return;
  const page=event.target.closest('.pdf-page');if(!page||page!==currentPage())return;event.preventDefault();
  const start=point(event,page),brush=tool?.value!=='rectangle',width=Number(size?.value||16)/page.clientWidth;
  const points=[start,{x:Math.min(1,start.x+.0001),y:start.y}];
  const draft=brush?svgStroke(page,points,width,'yellow',true):document.createElement('div');
  if(!brush){draft.className='pdf-region-draft';place(draft,{...start,w:0,h:0});}
  drag={page,draft,pointerId:event.pointerId,start,points,brush,width,pageNumber:getPage()};page.append(draft);
  try{page.setPointerCapture(event.pointerId);}catch(error){reset();say(error.message);}
 });
 content.addEventListener('pointermove',event=>{
  if(!drag||event.pointerId!==drag.pointerId)return;event.preventDefault();
  if(drag.brush){
   const samples=event.getCoalescedEvents?.();for(const sample of samples?.length?samples:[event]){const p=point(sample,drag.page),last=drag.points.at(-1);if(Math.hypot((p.x-last.x)*drag.page.clientWidth,(p.y-last.y)*drag.page.clientHeight)>.6&&drag.points.length<3000)drag.points.push(p);}
   drag.draft.firstChild.setAttribute('points',drag.points.map(p=>p.x*drag.page.clientWidth+','+p.y*drag.page.clientHeight).join(' '));
  }else place(drag.draft,rectangle(drag.start,point(event,drag.page)));
 });
 content.addEventListener('pointerup',async event=>{
  if(!drag||event.pointerId!==drag.pointerId)return;event.preventDefault();const d=drag,rect=rectangle(d.start,point(event,d.page));clearDrag();
  if(d.page!==currentPage()||d.pageNumber!==getPage())return;
  if(!d.brush&&(rect.w*d.page.clientWidth<3||rect.h*d.page.clientHeight<3)){say('矩形区域太小，请重新拖动。');return;}
  const annotation=d.brush?{quote:'第 '+d.pageNumber+' 页的荧光笔标记',page:d.pageNumber,stroke:{points:d.points,width:d.width}}:{quote:'第 '+d.pageNumber+' 页的区域高亮',page:d.pageNumber,rect};
  try{await onCreate(annotation);render();say('已保存标记，可继续涂画，或在右侧编辑这条标记的批注。');}catch(error){say('保存失败：'+error.message);}
 });
 const cancel=event=>{if(drag?.pointerId===event.pointerId)clearDrag();};content.addEventListener('pointercancel',cancel);content.addEventListener('lostpointercapture',cancel);
 reset();const api={render,reset};instances.set(content,api);return api;
}
