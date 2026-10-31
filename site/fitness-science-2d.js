import {KINDS} from './fitness-science-data.js';

const NS='http://www.w3.org/2000/svg';
const COLORS=['#547f9b','#4d8b77','#9479b0','#a78355','#ae7088','#628c8b','#887b64','#6c809b'];
const categoryColor=category=>COLORS[[...String(category)].reduce((sum,char)=>sum+char.charCodeAt(0),0)%COLORS.length];
function element(tag,attributes={},text){const el=document.createElementNS(NS,tag);for(const [key,value] of Object.entries(attributes))el.setAttribute(key,value);if(text!==undefined)el.textContent=text;return el;}
function splitLabel(label,max){
 const result=[];let line='',length=0;
 const tokens=String(label).match(/[A-Za-z0-9_]+(?:[+.-][A-Za-z0-9]+)*|[^\u0000-\u007f]|[\u0000-\u007f]/g)||[];
 const width=text=>[...text].reduce((sum,c)=>sum+(/[\u0000-\u00ff]/.test(c)?1:2),0);
 for(const token of tokens){const parts=width(token)>max?[...token]:[token];for(const part of parts){if(!line&&/^\s+$/.test(part))continue;const size=width(part);if(length+size>max&&line){result.push(line.trim());line='';length=0;}line+=part;length+=size;}}
 if(line.trim())result.push(line.trim());return result;
}

// Sort by ID rather than draw order so parallel semantic relations keep distinct lanes.
function parallelLanes(edges){
 const groups=new Map(),lanes=new Map();
 for(const edge of edges){const key=[edge.source,edge.target].sort().join('\u0000');if(!groups.has(key))groups.set(key,[]);groups.get(key).push(edge);}
 for(const group of groups.values())group.sort((a,b)=>String(a.id).localeCompare(String(b.id),'en',{numeric:true})).forEach((edge,index)=>lanes.set(edge.id,index-(group.length-1)/2));
 return lanes;
}

/** Native SVG renderer. Coordinates are normalized, and all navigation stays inside this view. */
export function createGraph2D(container,{onNode=()=>{},onEdge=()=>{}}={}){
 const uid='science-'+Math.random().toString(36).slice(2),defaultView=container.clientWidth<600?{x:380,y:0,w:900,h:1050}:{x:0,y:0,w:1600,h:1000};
 let view={...defaultView},graph={nodes:[],edges:[]},drag=null,destroyed=false;
 const svg=element('svg',{viewBox:'0 0 1600 1000',width:'100%',height:'100%',tabindex:'0',role:'group','aria-label':'二维知识图谱；拖动空白处平移，滚轮缩放，也可使用键盘加减号与方向键'});
 svg.style.cssText='display:block;min-height:380px;touch-action:none;user-select:none;';
 const defs=element('defs'),edgeLayer=element('g'),nodeLayer=element('g');
 for(const [kind,info] of Object.entries(KINDS))for(const reverse of [false,true]){
  const id=uid+'-'+kind+(reverse?'-start':'-end'),marker=element('marker',{id,viewBox:'0 0 10 10',refX:reverse?1:9,refY:5,markerWidth:6,markerHeight:6,orient:'auto-start-reverse',markerUnits:'strokeWidth'});
  marker.append(element('path',{d:'M 0 0 L 10 5 L 0 10 z',fill:info.color}));defs.append(marker);
 }
 svg.append(defs,edgeLayer,nodeLayer);container.append(svg);
 const apply=()=>svg.setAttribute('viewBox',`${view.x} ${view.y} ${view.w} ${view.h}`);
 function zoom(factor,point){const w=Math.max(260,Math.min(6400,view.w/factor)),ratio=w/view.w,p=point||{x:view.x+view.w/2,y:view.y+view.h/2};view={x:p.x-(p.x-view.x)*ratio,y:p.y-(p.y-view.y)*ratio,w,h:view.h*ratio};apply();}
 function localPoint(event){const p=new DOMPoint(event.clientX,event.clientY);return p.matrixTransform(svg.getScreenCTM().inverse());}
 function reset(){view={...defaultView};apply();}
 function focus(id){const n=graph.nodes.find(n=>n.id===id);if(!n)return;view.x=80+n.x*1440-view.w/2;view.y=90+n.y*760-view.h/2;apply();}
 function activate(el,callback){el.addEventListener('click',event=>{event.stopPropagation();callback();});el.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();event.stopPropagation();callback();}});}
 function update(next){
  graph=next;edgeLayer.replaceChildren();nodeLayer.replaceChildren();
  const positions=new Map(graph.nodes.map(n=>[n.id,{x:80+n.x*1440,y:90+n.y*760,node:n}])),lanes=parallelLanes(graph.edges);
  for(const e of graph.edges){
   const a=positions.get(e.source),b=positions.get(e.target);if(!a||!b)continue;
   const info=KINDS[e.kind]||KINDS.definition,dx=b.x-a.x,dy=b.y-a.y,length=Math.hypot(dx,dy)||1;
   const canonical=e.source<e.target?1:-1,offset=lanes.get(e.id)*96;
   const qx=(a.x+b.x)/2-dy/length*canonical*offset,qy=(a.y+b.y)/2+dx/length*canonical*offset;
   const startLength=Math.hypot(qx-a.x,qy-a.y)||1,endLength=Math.hypot(b.x-qx,b.y-qy)||1;
   const x1=a.x+(qx-a.x)/startLength*23,y1=a.y+(qy-a.y)/startLength*23,x2=b.x-(b.x-qx)/endLength*23,y2=b.y-(b.y-qy)/endLength*23;
   const related=graph.selectedId===e.source||graph.selectedId===e.target,selected=graph.selectedEdgeId===e.id;
   const d=`M ${x1} ${y1} Q ${qx} ${qy} ${x2} ${y2}`;
   const label=`${a.node.label} ${e.direction==='bidirectional'?'↔':'→'} ${b.node.label}：${e.label}（${info.label}）`;
   const group=element('g',{tabindex:0,role:'button','aria-label':label,'data-graph-edge':e.id,style:'cursor:pointer;outline:none'});
   const visible=element('path',{d,fill:'none',stroke:info.color,'stroke-width':selected?5:related?3:2,'stroke-opacity':graph.selectedId&&!related?.32:.8,'marker-end':`url(#${uid}-${e.kind in KINDS?e.kind:'definition'}-end)`});
   if(e.kind==='hypothesis')visible.setAttribute('stroke-dasharray','8 6');
   if(e.direction==='bidirectional')visible.setAttribute('marker-start',`url(#${uid}-${e.kind in KINDS?e.kind:'definition'}-start)`);
   const hit=element('path',{d,fill:'none',stroke:'transparent','stroke-width':20});
   const caption=element('g',{'aria-hidden':'true',opacity:0,'pointer-events':'none'}),width=Math.max(60,[...e.label].length*14+20),cx=(x1+2*qx+x2)/4,cy=(y1+2*qy+y2)/4;
   caption.append(element('rect',{x:cx-width/2,y:cy-14,width,height:28,rx:6,fill:'var(--bg, #fff)',stroke:info.color}),element('text',{x:cx,y:cy+5,'text-anchor':'middle',fill:'var(--text, #202622)','font-size':14},e.label));
   group.append(element('title',{},label),visible,hit,caption);
   const show=()=>{caption.setAttribute('opacity',1);visible.setAttribute('stroke-width',5);},hide=()=>{caption.setAttribute('opacity',0);visible.setAttribute('stroke-width',selected?5:related?3:2);};
   group.addEventListener('mouseenter',show);group.addEventListener('mouseleave',hide);group.addEventListener('focus',show);group.addEventListener('blur',hide);activate(group,()=>onEdge(e.id));edgeLayer.append(group);
  }
  for(const n of graph.nodes){
   const {x,y}=positions.get(n.id),selected=graph.selectedId===n.id,color=categoryColor(n.category),wrapped=splitLabel(n.displayLabel||n.label,14),radius=selected?23:18;
   const group=element('g',{transform:`translate(${x} ${y})`,tabindex:0,role:'button','aria-pressed':selected?'true':'false','aria-label':`${n.label}，${n.category}，${n.degree} 条连接，${n.crossDomainDegree} 条跨域连接`,'data-graph-node':n.id,style:'cursor:pointer;outline:none'});
   const halo=element('circle',{r:29,fill:'none',stroke:color,'stroke-width':2,opacity:selected?1:0});
   group.append(element('title',{},`${n.label}\n${n.category} · ${n.degree} 条连接 / ${n.crossDomainDegree} 条跨域连接`),halo,element('circle',{r:radius,fill:color,stroke:'var(--bg,#fff)','stroke-width':3}));
   const boxHeight=wrapped.length*26+10,boxWidth=Math.min(164,Math.max(70,...wrapped.map(line=>[...line].reduce((sum,c)=>sum+(/[\u0000-\u00ff]/.test(c)?11:21),0)+14)));
   group.append(element('rect',{x:-boxWidth/2,y:28,width:boxWidth,height:boxHeight,rx:6,fill:'var(--bg,#fff)','fill-opacity':.94,stroke:selected?color:'transparent'}));
   const text=element('text',{'text-anchor':'middle',fill:'var(--text,#202622)','font-family':'inherit','font-size':22,'font-weight':selected?650:500});wrapped.forEach((line,i)=>text.append(element('tspan',{x:0,y:51+i*26},line)));group.append(text);
   group.addEventListener('focus',()=>halo.setAttribute('opacity',1));group.addEventListener('blur',()=>halo.setAttribute('opacity',selected?1:0));activate(group,()=>onNode(n.id));nodeLayer.append(group);
  }
 }
 function wheel(event){event.preventDefault();zoom(Math.exp(-Math.max(-150,Math.min(150,event.deltaY))*.004),localPoint(event));}
 function down(event){if(event.button!==0||event.target.closest('[role="button"]'))return;const p=localPoint(event);drag={x:p.x,y:p.y,pointer:event.pointerId};svg.setPointerCapture(event.pointerId);svg.style.cursor='grabbing';}
 function move(event){if(!drag)return;const p=localPoint(event);view.x+=drag.x-p.x;view.y+=drag.y-p.y;apply();}
 function up(){drag=null;svg.style.cursor='';}
 function keyboard(event){if(event.target!==svg)return;const amount=view.w*.06;if(event.key==='+'||event.key==='=')zoom(1.25);else if(event.key==='-')zoom(.8);else if(event.key==='Home')reset();else if(event.key==='ArrowLeft'){view.x-=amount;apply();}else if(event.key==='ArrowRight'){view.x+=amount;apply();}else if(event.key==='ArrowUp'){view.y-=amount;apply();}else if(event.key==='ArrowDown'){view.y+=amount;apply();}else return;event.preventDefault();}
 svg.addEventListener('wheel',wheel,{passive:false});svg.addEventListener('pointerdown',down);svg.addEventListener('pointermove',move);svg.addEventListener('pointerup',up);svg.addEventListener('pointercancel',up);svg.addEventListener('keydown',keyboard);
 return{update,zoom,reset,focus,destroy(){if(destroyed)return;destroyed=true;svg.remove();}};
}
