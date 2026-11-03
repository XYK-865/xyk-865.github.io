const SVG='http://www.w3.org/2000/svg';
const projectNames={'personal-os':'人生元系统','decision-model':'判断与退出','life-checklist':'人生清单','mother-questions':'母题'};
const element=(tag,attrs={},text)=>{const el=document.createElement(tag);for(const [name,value]of Object.entries(attrs))el.setAttribute(name,value);if(text!==undefined)el.textContent=text;return el;};
const svgElement=(tag,attrs={},text)=>{const el=document.createElementNS(SVG,tag);for(const [name,value]of Object.entries(attrs))el.setAttribute(name,value);if(text!==undefined)el.textContent=text;return el;};

function titleLines(text,width){
 const lines=[];let line='',used=0;const limit=Math.max(6,(width-22)/13);
 for(const char of String(text)){const size=/[\u0000-\u00ff]/.test(char)?.56:1;if(used+size>limit&&line){lines.push(line);line='';used=0;}line+=char;used+=size;}
 if(line)lines.push(line);
 if(lines.length>2)return[lines[0],lines[1].slice(0,-1)+'…'];
 return lines;
}

/** A data-driven SVG view. Nodes keep the same IDs used by cards and the tree. */
export function renderProjectGraph({container,nodes=[],relations=[],projectId,onSelect,branchHref}){
 const controller=new AbortController(),signal=controller.signal;
 const all=new Map(nodes.map(node=>[node.id,node]));
 const focused=nodes.filter(node=>!projectId||node.projectId===projectId),focusIds=new Set(focused.map(node=>node.id));
 const relatedIds=new Set();
 for(const relation of relations){if(focusIds.has(relation.source)&&!focusIds.has(relation.target))relatedIds.add(relation.target);if(focusIds.has(relation.target)&&!focusIds.has(relation.source))relatedIds.add(relation.source);}
 const foreign=[...relatedIds].map(id=>all.get(id)).filter(Boolean);
 const shown=[...focused,...foreign],shownIds=new Set(shown.map(node=>node.id));
 const edges=[...shown.filter(node=>node.parentId&&shownIds.has(node.parentId)).map(node=>({source:node.parentId,target:node.id,label:'包含',type:'contains'})),...relations.filter(edge=>shownIds.has(edge.source)&&shownIds.has(edge.target))];
 const root=element('section',{class:'project-network','aria-label':'项目知识网络'});
 const toolbar=element('div',{class:'project-network-toolbar'}),hint=element('p',{},'拖动查看分支 · 滚轮或按钮缩放');
 const controls=element('div',{class:'project-network-controls','aria-label':'知识网络视图控制'});
 const zoomOut=element('button',{type:'button','data-graph-action':'zoom-out','aria-label':'缩小知识网络'},'−');
 const zoomValue=element('output',{'aria-label':'当前缩放比例','aria-live':'polite'},'100%');
 const zoomIn=element('button',{type:'button','data-graph-action':'zoom-in','aria-label':'放大知识网络'},'＋');
 const reset=element('button',{type:'button','data-graph-action':'reset'},'重置');
 const fit=element('button',{type:'button','data-graph-action':'fit'},'全图');
 controls.append(zoomOut,zoomValue,zoomIn,fit,reset);toolbar.append(hint,controls);
 const stage=element('div',{class:'project-network-stage',tabindex:'0',role:'region','aria-label':'可平移与缩放的分支关系图。方向键移动，点击节点查看内容。'});
 const svg=svgElement('svg',{class:'project-network-svg','aria-label':'分支与关联关系',role:'group'});
 const viewport=svgElement('g'),clusterLayer=svgElement('g',{'aria-hidden':'true'}),edgeLayer=svgElement('g',{'aria-hidden':'true'}),nodeLayer=svgElement('g'),labelLayer=svgElement('g',{'aria-hidden':'true'});
 viewport.append(clusterLayer,edgeLayer,nodeLayer,labelLayer);svg.append(viewport);stage.append(svg);
 const legend=element('div',{class:'project-network-legend'});
 for(const [kind,label]of [['contains','包含关系'],['related','关联关系'],['selected','当前分支']]){const item=element('span');item.append(element('i',{class:'project-network-key-'+kind,'aria-hidden':'true'}),document.createTextNode(label));legend.append(item);}
 const detail=element('div',{class:'project-network-detail','aria-live':'polite'});
 root.append(toolbar,stage,legend);if(typeof onSelect!=='function')root.append(detail);container.replaceChildren(root);
 let width=800,height=560,scale=1,x=0,y=0,layoutWidth=0,layoutHeight=0,selected=null,drag=null,ignoreClickUntil=0,resizeFrame;
 const positions=new Map(),nodeElements=new Map(),edgeElements=[];
 const paint=()=>{viewport.setAttribute('transform',`translate(${x} ${y}) scale(${scale})`);zoomValue.value=Math.round(scale*100)+'%';zoomValue.textContent=zoomValue.value;zoomOut.disabled=scale<=.15;zoomIn.disabled=scale>=2.4;};
 const home=()=>{scale=Math.min(1,(width-24)/Math.max(1,layoutWidth));x=(width-layoutWidth*scale)/2;y=24;paint();};
 const zoom=(factor,cx=width/2,cy=height/2)=>{const next=Math.max(.15,Math.min(2.4,scale*factor));x=cx-(cx-x)*next/scale;y=cy-(cy-y)*next/scale;scale=next;paint();};
 const fitAll=()=>{scale=Math.max(.15,Math.min(1,(width-24)/Math.max(1,layoutWidth),(height-24)/Math.max(1,layoutHeight)));x=(width-layoutWidth*scale)/2;y=(height-layoutHeight*scale)/2;paint();};
 const drawSelection=()=>{
  labelLayer.replaceChildren();
  const linked=new Set(selected?[selected.id]:[]);
  for(const edge of edges)if(selected&&(edge.source===selected.id||edge.target===selected.id)){linked.add(edge.source);linked.add(edge.target);}
  for(const [id,node]of nodeElements){node.classList.toggle('is-selected',id===selected?.id);node.classList.toggle('is-connected',id!==selected?.id&&linked.has(id));node.setAttribute('aria-pressed',String(id===selected?.id));}
  for(const {edge,path}of edgeElements){const active=!!selected&&(edge.source===selected.id||edge.target===selected.id);path.classList.toggle('is-active',active);if(!active||edge.type==='contains')continue;const a=positions.get(edge.source),b=positions.get(edge.target);if(!a||!b)continue;const cx=(a.x+b.x)/2,cy=(a.y+b.y)/2-8,label=String(edge.label||'关联');const box=svgElement('g',{class:'project-network-edge-label',transform:`translate(${cx} ${cy})`});box.append(svgElement('rect',{x:-Math.max(26,label.length*6.5+9),y:-12,width:Math.max(52,label.length*13+18),height:24,rx:7}),svgElement('text',{'text-anchor':'middle',y:4},label));labelLayer.append(box);}
 };
 const select=(node,notify=true)=>{
  selected=node;detail.replaceChildren();
  const text=element('div'),kicker=element('small',{},foreign.some(item=>item.id===node.id)?'关联项目 · '+(projectNames[node.projectId]||'相关分支'):(node.kind==='group'?'分支分组':'当前分支'));
  text.append(kicker,element('h3',{},node.title),element('p',{},node.summary||''));detail.append(text);
  const href=typeof branchHref==='function'?branchHref(node):null;
  if(href){const url=new URL(href,location.href);if(['http:','https:'].includes(url.protocol))detail.append(element('a',{href,class:'project-network-open'},'进入分支 →'));}
  drawSelection();if(notify&&typeof onSelect==='function')onSelect(node);
 };
 function layout(){
  width=Math.max(280,stage.clientWidth);height=stage.clientHeight||560;svg.setAttribute('viewBox',`0 0 ${width} ${height}`);
  const columns=Math.max(1,Math.min(3,Math.floor((width-24)/330))),clusterWidth=Math.min(330,width-24),gap=24;
  const roots=focused.filter(node=>!node.parentId||!focusIds.has(node.parentId));
  const children=new Map();for(const node of focused){if(!children.has(node.parentId))children.set(node.parentId,[]);children.get(node.parentId).push(node);}
  const descendants=node=>{const result=[],seen=new Set([node.id]);const visit=id=>{for(const child of children.get(id)||[])if(!seen.has(child.id)){seen.add(child.id);result.push(child);visit(child.id);}};visit(node.id);return result;};
  const clusters=roots.map(node=>({node,members:descendants(node)}));
  if(foreign.length)clusters.push({node:null,title:'关联项目分支',members:foreign});
  const specs=clusters.map(cluster=>{const memberColumns=cluster.members.length>4?2:1;return{...cluster,memberColumns,rows:Math.ceil(cluster.members.length/memberColumns),height:118+Math.ceil(cluster.members.length/memberColumns)*82};});
  positions.clear();nodeElements.clear();edgeElements.length=0;clusterLayer.replaceChildren();edgeLayer.replaceChildren();nodeLayer.replaceChildren();
  let top=0;
  for(let start=0;start<specs.length;start+=columns){const row=specs.slice(start,start+columns),rowHeight=Math.max(...row.map(cluster=>cluster.height));
   row.forEach((cluster,column)=>{const left=column*(clusterWidth+gap),center=left+clusterWidth/2;
    clusterLayer.append(svgElement('rect',{x:left,y:top,width:clusterWidth,height:cluster.height-18,rx:18,class:'project-network-cluster'}));
    if(cluster.node)positions.set(cluster.node.id,{x:center,y:top+45,width:Math.min(220,clusterWidth-30),height:62});
    else nodeLayer.append(svgElement('text',{x:center,y:top+48,'text-anchor':'middle',class:'project-network-related-heading'},cluster.title));
    const memberWidth=cluster.memberColumns===2?(clusterWidth-42)/2:Math.min(240,clusterWidth-30);
    cluster.members.forEach((node,index)=>{const column=index%cluster.memberColumns,row=Math.floor(index/cluster.memberColumns),cx=cluster.memberColumns===2?left+14+memberWidth/2+column*(memberWidth+14):center;positions.set(node.id,{x:cx,y:top+132+row*82,width:memberWidth,height:62});});
   });top+=rowHeight+gap;
  }
  layoutWidth=Math.min(columns,specs.length)*(clusterWidth+gap)-gap;
  layoutHeight=Math.max(1,top-gap);
  for(const edge of edges){const a=positions.get(edge.source),b=positions.get(edge.target);if(!a||!b)continue;const contains=edge.type==='contains',startY=a.y+(contains?a.height/2:0),endY=b.y-(contains?b.height/2:0);const d=contains?`M${a.x},${startY} C${a.x},${(startY+endY)/2} ${b.x},${(startY+endY)/2} ${b.x},${endY}`:`M${a.x},${a.y} Q${(a.x+b.x)/2},${Math.min(a.y,b.y)-45} ${b.x},${b.y}`;const path=svgElement('path',{d,class:'project-network-edge '+(contains?'is-hierarchy':'is-relation')});edgeLayer.append(path);edgeElements.push({edge,path});}
  for(const node of shown){const pos=positions.get(node.id);if(!pos)continue;const group=svgElement('g',{class:'project-network-node'+(node.kind==='group'?' is-group':'')+(focusIds.has(node.id)?'':' is-foreign'),transform:`translate(${pos.x} ${pos.y})`,tabindex:'0',role:'button','aria-label':node.title+'，查看分支','aria-pressed':'false','data-graph-node':node.id});
   group.append(svgElement('title',{},node.title),svgElement('rect',{x:-pos.width/2,y:-pos.height/2,width:pos.width,height:pos.height,rx:11}));
   const lines=titleLines(node.title,pos.width);lines.forEach((line,index)=>group.append(svgElement('text',{x:0,y:(lines.length===1?5:-4)+index*19,'text-anchor':'middle'},line)));
   group.addEventListener('focus',()=>{const cx=pos.x*scale+x,cy=pos.y*scale+y;if(cx<20||cx>width-20||cy<20||cy>height-20){x=width/2-pos.x*scale;y=height/2-pos.y*scale;paint();}},{signal});
   group.addEventListener('click',()=>{if(performance.now()>ignoreClickUntil)select(node);},{signal});group.addEventListener('keydown',event=>{if(['Enter',' '].includes(event.key)){event.preventDefault();select(node);}},{signal});nodeLayer.append(group);nodeElements.set(node.id,group);
  }
  home();drawSelection();
 }
 zoomOut.addEventListener('click',()=>zoom(1/1.2),{signal});zoomIn.addEventListener('click',()=>zoom(1.2),{signal});reset.addEventListener('click',home,{signal});
 fit.addEventListener('click',fitAll,{signal});
 stage.addEventListener('wheel',event=>{event.preventDefault();const rect=stage.getBoundingClientRect();zoom(Math.exp(-event.deltaY*.0015),event.clientX-rect.left,event.clientY-rect.top);},{passive:false,signal});
 stage.addEventListener('pointerdown',event=>{if(event.button!==0)return;drag={id:event.pointerId,startX:event.clientX,startY:event.clientY,x,y,moved:false};},{signal});
 stage.addEventListener('pointermove',event=>{if(!drag||event.pointerId!==drag.id)return;const dx=event.clientX-drag.startX,dy=event.clientY-drag.startY;if(!drag.moved&&Math.hypot(dx,dy)>5){drag.moved=true;stage.setPointerCapture(event.pointerId);stage.classList.add('is-dragging');}if(drag.moved){x=drag.x+dx;y=drag.y+dy;paint();}},{signal});
 const stop=event=>{if(!drag||event.pointerId!==drag.id)return;if(drag.moved){ignoreClickUntil=performance.now()+200;if(stage.hasPointerCapture(event.pointerId))stage.releasePointerCapture(event.pointerId);}drag=null;stage.classList.remove('is-dragging');};
 stage.addEventListener('pointerup',stop,{signal});stage.addEventListener('pointercancel',stop,{signal});
 stage.addEventListener('keydown',event=>{if(event.target!==stage)return;const movement={ArrowLeft:[35,0],ArrowRight:[-35,0],ArrowUp:[0,35],ArrowDown:[0,-35]}[event.key];if(movement){event.preventDefault();x+=movement[0];y+=movement[1];paint();}else if(['+','=','-','0'].includes(event.key)){event.preventDefault();if(event.key==='0')home();else zoom(event.key==='-'?1/1.2:1.2);}},{signal});
 const observer=new ResizeObserver(()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(layout);});observer.observe(stage);
 layout();const initial=focused.find(node=>node.kind==='branch')||focused[0];if(initial)select(initial);else detail.append(element('p',{},'当前还没有可展示的分支。'));
 return{destroy(){controller.abort();observer.disconnect();cancelAnimationFrame(resizeFrame);root.remove();}};
}
