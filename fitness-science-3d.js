import * as THREE from './assets/body/three.module.js';
import {OrbitControls} from './assets/body/OrbitControls.js';
import {KINDS} from './fitness-science-data.js';

const COLORS=['#547f9b','#4d8b77','#9479b0','#a78355','#ae7088','#628c8b','#887b64','#6c809b'];
const categoryColor=category=>COLORS[[...String(category)].reduce((sum,char)=>sum+char.charCodeAt(0),0)%COLORS.length];
const position=n=>new THREE.Vector3((n.x-.5)*26,(.5-n.y)*15,(n.z-.5)*9);
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

/** WebGL renderer is loaded only when the visitor selects 3D. No remote dependencies. */
export async function createGraph3D(container,{onNode=()=>{},onEdge=()=>{}}={}){
 const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));renderer.outputColorSpace=THREE.SRGBColorSpace;
 const originalPosition=container.style.position;if(getComputedStyle(container).position==='static')container.style.position='relative';
 const canvas=renderer.domElement;canvas.style.cssText='display:block;width:100%;height:100%;min-height:380px;touch-action:none;';canvas.tabIndex=0;canvas.setAttribute('role','img');canvas.setAttribute('aria-label','三维知识网络；拖动旋转、滚轮缩放。可展开下方键盘选择列表。');container.append(canvas);
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(42,1,.1,300),controls=new OrbitControls(camera,canvas);
 controls.enableDamping=false;controls.minDistance=5;controls.maxDistance=100;controls.enablePan=true;
 const raycaster=new THREE.Raycaster();raycaster.params.Line.threshold=.16;
 let group=new THREE.Group(),pickables=[],graph={nodes:[],edges:[]},disposed=false,fitDistance=30,down=null,frame=0;
 scene.add(group);
 const tooltip=document.createElement('div');tooltip.className='science-graph-tooltip';tooltip.style.cssText='position:absolute;z-index:2;pointer-events:none;display:none;max-width:260px;padding:8px 11px;border:1px solid var(--line,#ddd);border-radius:8px;background:var(--bg,#fff);color:var(--text,#222);font:12px/1.6 sans-serif;box-shadow:0 4px 18px #0001;';container.append(tooltip);
 const access=document.createElement('details');access.className='science-graph-keyboard';access.style.cssText='position:absolute;left:12px;bottom:12px;z-index:3;max-width:calc(100% - 24px);max-height:210px;overflow:auto;border:1px solid var(--line,#ddd);border-radius:8px;background:var(--bg,#fff);color:var(--text,#222);padding:6px 9px;font:12px/1.6 sans-serif;';
 const summary=document.createElement('summary');summary.textContent='键盘选择节点与关系';summary.style.cursor='pointer';const list=document.createElement('div');list.style.cssText='display:flex;flex-wrap:wrap;gap:5px;padding-top:8px;max-width:500px;';access.append(summary,list);container.append(access);
 function render(){if(disposed)return;renderer.render(scene,camera);}
 function requestRender(){if(disposed||frame)return;frame=requestAnimationFrame(()=>{frame=0;render();});}
 controls.addEventListener('change',requestRender);
 function resize(){if(disposed)return;const width=Math.max(1,container.clientWidth),height=Math.max(380,container.clientHeight);renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();requestRender();}
 const observer=new ResizeObserver(resize);observer.observe(container);
 function release(){const geometries=new Set(),materials=new Set(),textures=new Set();group.traverse(object=>{if(object.geometry)geometries.add(object.geometry);for(const material of Array.isArray(object.material)?object.material:object.material?[object.material]:[]){materials.add(material);if(material.map)textures.add(material.map);}});for(const item of [...geometries,...materials,...textures])item.dispose();scene.remove(group);group=new THREE.Group();scene.add(group);pickables=[];}
 function labelSprite(node,selected){
  const lines=splitLabel(node.displayLabel||node.label,14),surface=document.createElement('canvas');surface.width=320;surface.height=lines.length*48+24;
  const ctx=surface.getContext('2d'),style=getComputedStyle(container);ctx.fillStyle=style.getPropertyValue('--bg').trim()||'#fff';ctx.globalAlpha=.94;ctx.fillRect(0,0,surface.width,surface.height);ctx.globalAlpha=1;ctx.fillStyle=style.getPropertyValue('--text').trim()||'#202622';ctx.font=`${selected?'600':'500'} 40px sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';lines.forEach((line,i)=>ctx.fillText(line,160,36+i*48,296));
  const texture=new THREE.CanvasTexture(surface);texture.colorSpace=THREE.SRGBColorSpace;
  const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true,depthTest:false}));sprite.scale.set(2.65,2.65*surface.height/320,1);sprite.position.copy(position(node));sprite.position.y-=.55+sprite.scale.y/2;sprite.renderOrder=2;sprite.userData={nodeId:node.id,label:node.label};return sprite;
 }
 function accessibleButton(text,attrs,callback){const button=document.createElement('button');button.type='button';button.textContent=text;button.style.cssText='font:inherit;padding:4px 7px;border:1px solid var(--line,#ccc);border-radius:5px;background:var(--panel,#f5f5f2);color:inherit;cursor:pointer;';for(const [key,value] of Object.entries(attrs))button.setAttribute(key,value);button.addEventListener('click',callback);list.append(button);}
 function arrow(tip,direction,color,edgeId){const cone=new THREE.Mesh(new THREE.ConeGeometry(.10,.30,8),new THREE.MeshBasicMaterial({color}));cone.position.copy(tip).addScaledVector(direction,-.15);cone.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),direction);cone.userData={edgeId};group.add(cone);pickables.push(cone);}
 function update(next){
  graph=next;release();list.replaceChildren();tooltip.style.display='none';const nodes=new Map(graph.nodes.map(n=>[n.id,n])),lanes=parallelLanes(graph.edges);
  for(const edge of graph.edges){
   const source=nodes.get(edge.source),target=nodes.get(edge.target);if(!source||!target)continue;
   const a=position(source),b=position(target),direction=b.clone().sub(a).normalize();
   const canonical=direction.clone().multiplyScalar(edge.source<edge.target?1:-1),normal=new THREE.Vector3(-canonical.y,canonical.x,0);
   if(normal.lengthSq()<.001)normal.set(1,0,0);normal.normalize();
   const middle=a.clone().add(b).multiplyScalar(.5).addScaledVector(normal,lanes.get(edge.id)*1.8);
   a.addScaledVector(middle.clone().sub(a).normalize(),.29);b.addScaledVector(middle.clone().sub(b).normalize(),.29);
   const curve=new THREE.QuadraticBezierCurve3(a,middle,b);
   const info=KINDS[edge.kind]||KINDS.definition,related=graph.selectedId===source.id||graph.selectedId===target.id,selected=graph.selectedEdgeId===edge.id;
   const material=edge.kind==='hypothesis'?new THREE.LineDashedMaterial({color:info.color,dashSize:.24,gapSize:.16,transparent:true,opacity:graph.selectedId&&!related?.26:.8}):new THREE.LineBasicMaterial({color:info.color,transparent:true,opacity:graph.selectedId&&!related?.26:selected?1:.8});
   const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(36)),material);if(edge.kind==='hypothesis')line.computeLineDistances();
   const label=`${source.label} ${edge.direction==='bidirectional'?'↔':'→'} ${target.label}：${edge.label}（${info.label}）`;line.userData={edgeId:edge.id,label};group.add(line);pickables.push(line);
   arrow(b,curve.getTangent(1).normalize(),info.color,edge.id);if(edge.direction==='bidirectional')arrow(a,curve.getTangent(0).normalize().negate(),info.color,edge.id);
   accessibleButton(label,{'data-graph-edge':edge.id},()=>onEdge(edge.id));
  }
  const nodeButtons=[];
  for(const node of graph.nodes){
   const selected=graph.selectedId===node.id,radius=(.20+Math.min(node.degree,8)*.009)*(selected?1.35:1),mesh=new THREE.Mesh(new THREE.SphereGeometry(radius,20,12),new THREE.MeshBasicMaterial({color:categoryColor(node.category)}));mesh.position.copy(position(node));mesh.userData={nodeId:node.id,label:`${node.label} · ${node.category}\n${node.degree} 条连接 / ${node.crossDomainDegree} 条跨域连接`};group.add(mesh);pickables.push(mesh);
   const sprite=labelSprite(node,selected);group.add(sprite);pickables.push(sprite);
   const button=document.createElement('button');nodeButtons.push(button);button.type='button';button.textContent=node.label;button.setAttribute('data-graph-node',node.id);button.setAttribute('aria-pressed',String(selected));button.style.cssText='font:inherit;padding:4px 7px;border:1px solid var(--line,#ccc);border-radius:5px;background:var(--panel,#f5f5f2);color:inherit;cursor:pointer;';button.addEventListener('click',()=>onNode(node.id));
  }
  list.prepend(...nodeButtons);requestRender();
 }
 function reset(){resize();const halfY=8.5,halfX=14;fitDistance=Math.max(halfY/Math.tan(THREE.MathUtils.degToRad(camera.fov/2)),halfX/(Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*camera.aspect))+4;controls.target.set(0,0,0);camera.position.set(0,0,fitDistance);controls.update();requestRender();}
 function zoom(factor){const direction=camera.position.clone().sub(controls.target),distance=Math.max(controls.minDistance,Math.min(controls.maxDistance,direction.length()/factor));direction.setLength(distance);camera.position.copy(controls.target).add(direction);controls.update();requestRender();}
 function focus(id){const node=graph.nodes.find(n=>n.id===id);if(!node)return;const offset=camera.position.clone().sub(controls.target);controls.target.copy(position(node));camera.position.copy(controls.target).add(offset);controls.update();requestRender();}
 function hit(event){const rect=canvas.getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1),camera);return raycaster.intersectObjects(pickables,false)[0]?.object.userData;}
 function move(event){if(down)return;const item=hit(event);canvas.style.cursor=item?'pointer':'grab';if(!item){tooltip.style.display='none';return;}const edge=item.edgeId&&graph.edges.find(edge=>edge.id===item.edgeId);const rect=container.getBoundingClientRect();tooltip.textContent=item.label||(edge?`${edge.label}（${KINDS[edge.kind]?.label||edge.kind}）`:'');tooltip.style.display='block';tooltip.style.left=Math.max(8,Math.min(event.clientX-rect.left+12,rect.width-275))+'px';tooltip.style.top=Math.max(8,event.clientY-rect.top-45)+'px';}
 function pointerDown(event){down={x:event.clientX,y:event.clientY};tooltip.style.display='none';}
 function pointerUp(event){if(!down)return;const click=Math.hypot(event.clientX-down.x,event.clientY-down.y)<6;down=null;if(!click)return;const item=hit(event);if(item?.nodeId)onNode(item.nodeId);else if(item?.edgeId)onEdge(item.edgeId);}
 function leave(){down=null;tooltip.style.display='none';}
 function keyboard(event){if(event.target!==canvas)return;if(event.key==='+'||event.key==='=')zoom(1.25);else if(event.key==='-')zoom(.8);else if(event.key==='Home')reset();else return;event.preventDefault();}
 canvas.addEventListener('pointerdown',pointerDown);canvas.addEventListener('pointerup',pointerUp);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerleave',leave);canvas.addEventListener('keydown',keyboard);
 reset();
 return{update,zoom,reset,focus,destroy(){if(disposed)return;disposed=true;observer.disconnect();if(frame)cancelAnimationFrame(frame);controls.dispose();release();renderer.dispose();renderer.forceContextLoss();canvas.remove();tooltip.remove();access.remove();container.style.position=originalPosition;}};
}
