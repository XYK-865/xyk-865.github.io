import * as THREE from '../body/three.module.js';

const svgNS='http://www.w3.org/2000/svg';
const make=(tag,attrs={},text)=>{const el=document.createElement(tag);for(const [key,value]of Object.entries(attrs))el.setAttribute(key,value);if(text!==undefined)el.textContent=text;return el;};
const svg=(tag,attrs={})=>{const el=document.createElementNS(svgNS,tag);for(const [key,value]of Object.entries(attrs))el.setAttribute(key,value);return el;};
const views={
 'os-society':{lens:'我所处的环境',role:'把社会规则、组织与合作环境纳入判断，辨认哪些是现实条件，哪些只是自己的解释。',connections:[['os-career','从组织环境看职业选择'],['os-friendship','从互惠与边界看日常相处']]},
 'os-friendship':{lens:'我与他人的连接',role:'从信任、真实相处与双方投入观察关系，给维护友谊留出具体的位置。',connections:[['os-time','相处需要可支配的时间'],['os-society','关系也处在社会与合作情境中']]},
 'os-romance':{lens:'亲密关系与边界',role:'分开观察实际回应、个人期待与共同承诺，理解关系在自己的生活中占据什么位置。',connections:[['os-time','共同生活需要协商时间'],['os-money','共同承诺涉及资源安排']]},
 'os-money':{lens:'资源与选择空间',role:'把收入、支出、风险和未来选择一起考虑，观察资源安排如何进入自己的具体决定。',connections:[['os-career','工作选择涉及收入与投入'],['os-time','金钱与时间常需要一起比较']]},
 'os-health':{lens:'精力、恢复与日常',role:'从运动、恢复、睡眠和饮食观察自己的身心感受，再回看哪些日常安排值得调整。',connections:[['os-time','训练、作息和恢复都需要时间'],['os-career','把工作安排与身心感受一起回看']]},
 'os-time':{lens:'注意力与生活节奏',role:'看清重要事情获得了多少时间，比较优先级、实际耗时和放弃其他选择的代价。',connections:[['os-health','给训练和恢复留下安排'],['os-learning','给练习、反馈与复习留下位置']]},
 'os-career':{lens:'任务、环境与发展',role:'把工作任务、能力积累和生活代价放在一起看，不只用一个指标解释职业选择。',connections:[['os-money','收入与工作成本需要一起比较'],['os-learning','实际任务能带来能力反馈']]},
 'os-learning':{lens:'理解与更新判断',role:'用解释、实践和反馈检验理解，让新知识有机会改变自己的判断与行动。',connections:[['os-career','在实际任务中检验知识'],['os-society','辨认事实、解释与不同观点']]}
};
const colors=['#79b6d5','#aaa0ce','#d4a1b1','#d3b17d','#84bba5','#859ed0','#ca967b','#b4bf87'];
// Orbital size, tilt and phase are for visual separation, not measured life-domain values.
const orbitalLayout=[
 {radius:1.6,ratio:.94,tiltX:.12,tiltZ:.28,phase:1.15,size:.26},
 {radius:2.12,ratio:.94,tiltX:.06,tiltZ:.23,phase:3.85,size:.3},
 {radius:2.66,ratio:.94,tiltX:.17,tiltZ:.28,phase:5.6,size:.34},
 {radius:3.2,ratio:.94,tiltX:.05,tiltZ:.22,phase:2.48,size:.37},
 {radius:3.76,ratio:.94,tiltX:.13,tiltZ:.27,phase:.05,size:.4},
 {radius:4.3,ratio:.94,tiltX:.07,tiltZ:.23,phase:4.62,size:.36},
 {radius:4.84,ratio:.94,tiltX:.16,tiltZ:.29,phase:1.96,size:.43},
 {radius:5.4,ratio:.94,tiltX:.08,tiltZ:.24,phase:3.35,size:.4}
];
let instanceCount=0;

/** A qualitative life-domain map; positions and lines do not encode measured effects. */
export function renderLifeDomains({container,nodes=[],branchHref,onSelect}){
 const domains=nodes.slice(0,8),abort=new AbortController(),signal=abort.signal;
 const id='domain-world-'+(++instanceCount);
 const root=make('section',{class:'domain-world','aria-labelledby':id+'-title','data-domain-world':''});
 const header=make('header',{class:'domain-world-heading'});
 const heading=make('div');heading.append(make('p',{class:'domain-world-kicker'},'PERSONAL OS / LIFE IN ORBIT'),make('h3',{id:id+'-title'},'八个领域，围绕我的生活'),make('p',{},'像行星围绕太阳，让八个领域各有自己的轨道。转动视角，选择一个领域，看看它与日常生活的联系。'));
 header.append(heading,make('span',{class:'domain-world-badge'},'生活星系 · 关联示意'));
 const workspace=make('div',{class:'domain-world-workspace'}),visual=make('div',{class:'domain-world-visual'});
 const toolbar=make('div',{class:'domain-world-toolbar'}),mode=make('p',{class:'domain-world-mode','data-domain-mode':''},'生活星系 · 3D');
 const controls=make('div',{class:'domain-world-controls','aria-label':'人生领域视图控制'});
 const zoomOut=make('button',{type:'button','data-domain-action':'zoom-out','aria-label':'缩小人生领域视图'},'−');
 const zoomIn=make('button',{type:'button','data-domain-action':'zoom-in','aria-label':'放大人生领域视图'},'＋');
 const reset=make('button',{type:'button','data-domain-action':'reset'},'重置');
 const auto=make('button',{type:'button','data-domain-action':'auto','aria-pressed':'false'},'自动公转');
 controls.append(zoomOut,zoomIn,reset,auto);toolbar.append(mode,controls);
 const stage=make('div',{class:'domain-world-stage',tabindex:'0',role:'region','aria-label':'人生八大领域立体结构，可拖动旋转、滚轮缩放，也可使用下方领域按钮。'});
 const fallback=svg('svg',{class:'domain-world-fallback',viewBox:'0 0 600 470','aria-hidden':'true'});
 const defs=svg('defs'),sunGradient=svg('radialGradient',{id:id+'-sun',cx:'35%',cy:'30%'});
 sunGradient.append(svg('stop',{offset:'0%','stop-color':'#f6e5c5'}),svg('stop',{offset:'50%','stop-color':'#d7b382'}),svg('stop',{offset:'100%','stop-color':'#79604a'}));defs.append(sunGradient);fallback.append(defs);
 const fallbackOrbits=svg('g'),fallbackPlanets=svg('g'),fallbackSun=svg('circle',{class:'domain-world-fallback-sun',fill:'url(#'+id+'-sun)'});
 fallback.append(fallbackOrbits,fallbackSun,fallbackPlanets);
 const overlay=make('div',{class:'domain-world-labels'}),leaders=svg('svg',{class:'domain-world-leaders','aria-hidden':'true'});
 const me=make('div',{class:'domain-world-me','aria-hidden':'true'});me.append(make('strong',{},'我'));
 const pins=new Map(),leaderLines=new Map(),keys=new Map(),fallbackPaths=new Map(),fallbackSpheres=new Map();
 domains.forEach((node,index)=>{
  const pin=make('button',{type:'button',class:'domain-world-pin','data-domain-pin':node.id,'aria-pressed':'false'});pin.append(make('i',{'aria-hidden':'true'}),make('span',{},node.title));pin.style.setProperty('--domain-node-color',colors[index]);
  overlay.append(pin);pins.set(node.id,pin);
  const line=svg('line',{class:'domain-world-leader'});leaders.append(line);leaderLines.set(node.id,line);
  const path=svg('polyline',{class:'domain-world-fallback-orbit'});path.style.setProperty('--domain-node-color',colors[index]);fallbackOrbits.append(path);fallbackPaths.set(node.id,path);
  const gradient=svg('radialGradient',{id:id+'-planet-'+index,cx:'28%',cy:'25%',r:'75%'});
  gradient.append(svg('stop',{offset:'0%','stop-color':new THREE.Color(colors[index]).lerp(new THREE.Color('#ffffff'),.32).getStyle()}),svg('stop',{offset:'48%','stop-color':colors[index]}),svg('stop',{offset:'100%','stop-color':new THREE.Color(colors[index]).multiplyScalar(.23).getStyle()}));defs.append(gradient);
  const sphere=svg('circle',{class:'domain-world-fallback-planet',fill:'url(#'+id+'-planet-'+index+')'});fallbackPlanets.append(sphere);fallbackSpheres.set(node.id,sphere);
 });
 stage.append(fallback,leaders,overlay,me);
 const help=make('p',{class:'domain-world-help'},'拖动旋转 · 滚轮或 ＋ / − 缩放 · 方向键旋转');
 visual.append(toolbar,stage,help);
 const detail=make('aside',{class:'domain-world-detail','aria-live':'polite'});
 workspace.append(visual,detail);
 const selector=make('div',{class:'domain-world-selector','aria-label':'选择人生领域',role:'group'});
 domains.forEach((node,index)=>{const key=make('button',{type:'button','data-domain-select':node.id,'aria-pressed':'false'});key.style.setProperty('--domain-node-color',colors[index]);key.append(make('i',{'aria-hidden':'true'}),make('span',{},node.title));keys.set(node.id,key);selector.append(key);});
 root.append(header,workspace,selector,make('p',{class:'domain-world-footnote'},'太阳与行星是生活领域的视觉比喻。轨道、大小、距离与连线只作示意，不表示个人评分、领域优先级或实际天体数据。'));
 container.replaceChildren(root);
 const byId=new Map(domains.map(node=>[node.id,node]));
 let selected=domains.find(node=>node.id==='os-health')||domains[0],renderer=null,scene=null,camera=null,world=null;
 let frame=0,visible=true,disposed=false,width=600,height=470,lastTime=0,autoRotate=false,drag=null;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 auto.disabled=reduced.matches;
 if(reduced.matches)auto.title='已遵循减少动态效果偏好，仍可手动旋转。';
 const initial={azimuth:.36,polar:1.02,distance:13.8};
 const orbit={...initial};
 const nodeMeshes=new Map(),domainLines=new Map(),activeLinks=[],ownedGeometries=new Set(),ownedMaterials=new Set(),ownedTextures=new Set();
 const positions=new Map(),points=[];
 const spherical=new THREE.Spherical(),projected=new THREE.Vector3(),raycaster=new THREE.Raycaster(),mouse=new THREE.Vector2();
 const fallbackCamera=new THREE.PerspectiveCamera(42,1,.1,80);
 let elapsedOrbit=0;
 function orbitalPoint(index,phase=orbitalLayout[index].phase){const layout=orbitalLayout[index];return new THREE.Vector3(Math.cos(phase)*layout.radius,0,Math.sin(phase)*layout.radius*layout.ratio).applyAxisAngle(new THREE.Vector3(1,0,0),layout.tiltX).applyAxisAngle(new THREE.Vector3(0,0,1),layout.tiltZ);}
 function orbitalPath(index){return Array.from({length:129},(_,point)=>orbitalPoint(index,point/128*Math.PI*2));}
 domains.forEach((node,index)=>positions.set(node.id,orbitalPoint(index)));
 function validLink(node){if(typeof branchHref!=='function')return null;try{const url=new URL(branchHref(node),location.href);return ['http:','https:'].includes(url.protocol)?url.href:null;}catch{return null;}}
 function addDetail(node){
  detail.replaceChildren();const info=views[node.id]||{lens:'观察这个生活领域',role:node.summary||'',connections:[]};
  detail.append(make('p',{class:'domain-world-detail-kicker'},'这个领域与我'),make('h4',{'data-domain-title':''},node.title),make('strong',{class:'domain-world-lens'},info.lens),make('p',{class:'domain-world-role'},info.role));
  const connections=info.connections.filter(([target])=>byId.has(target));
  if(connections.length){detail.append(make('h5',{},'也可以一起回看'));
   const list=make('ul');for(const [target,description]of connections){const item=make('li'),button=make('button',{type:'button','data-domain-related':target});button.append(make('strong',{},byId.get(target).title+' ↗'),make('span',{},description));button.addEventListener('click',()=>select(byId.get(target)),{signal});item.append(button);list.append(item);}detail.append(list);
  }
  const href=validLink(node);if(href)detail.append(make('a',{class:'domain-world-open',href},'进入'+node.title+'分支 →'));
 }
 function updateSelection(){
  for(const node of domains){const active=node.id===selected?.id;pins.get(node.id).setAttribute('aria-pressed',String(active));keys.get(node.id).setAttribute('aria-pressed',String(active));pins.get(node.id).classList.toggle('is-selected',active);
   const mesh=nodeMeshes.get(node.id);if(mesh){mesh.scale.setScalar(active?1.1:1);mesh.material.emissiveIntensity=active ? .035 : .012;}
   const line=domainLines.get(node.id);if(line){line.material.opacity=active ? .42 : .105;line.material.color.set(active?colors[domains.indexOf(node)]:'#9dabc3');}
   fallbackPaths.get(node.id).classList.toggle('is-selected',active);fallbackSpheres.get(node.id).classList.toggle('is-selected',active);
   leaderLines.get(node.id).style.stroke=active?colors[domains.indexOf(node)]:'';
  }
  for(const link of activeLinks){world?.remove(link);link.geometry.dispose();link.material.dispose();}activeLinks.length=0;
  if(world&&selected){const info=views[selected.id];for(const [target]of info?.connections||[]){if(!positions.has(target))continue;const geometry=new THREE.BufferGeometry();const material=new THREE.LineDashedMaterial({color:'#b7c9cf',transparent:true,opacity:.24,dashSize:.035,gapSize:.14});const line=new THREE.Line(geometry,material);line.userData.target=target;world.add(line);activeLinks.push(line);}updateConnections();}
 }
 function updateConnections(){if(!selected)return;const start=positions.get(selected.id);for(const line of activeLinks){const end=positions.get(line.userData.target),mid=start.clone().add(end).multiplyScalar(.5);mid.y+=.65;line.geometry.setFromPoints(new THREE.QuadraticBezierCurve3(start,mid,end).getPoints(40));line.computeLineDistances();}}
 function select(node,notify=true){if(!node)return;selected=node;addDetail(node);updateSelection();invalidate();if(notify&&typeof onSelect==='function')onSelect(node);}
 for(const [nodeId,pin]of pins)pin.addEventListener('click',()=>select(byId.get(nodeId)),{signal});
 for(const [nodeId,key]of keys)key.addEventListener('click',()=>select(byId.get(nodeId)),{signal});
 function ownGeometry(geometry){ownedGeometries.add(geometry);return geometry;}
 function ownMaterial(material){ownedMaterials.add(material);return material;}
 function mesh(geometry,material,parent=world){const result=new THREE.Mesh(ownGeometry(geometry),material);parent.add(result);return result;}
 // Deterministic canvas materials keep the metaphor self-contained, without planet photographs.
 function surfaceTexture(index){
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=256;const context=canvas.getContext('2d');if(!context)return null;
  const pixels=context.createImageData(512,256),base=new THREE.Color(index===8?'#d8b88b':colors[index]).convertLinearToSRGB();
  const red=base.r*255,green=base.g*255,blue=base.b*255;
  for(let y=0;y<256;y++)for(let x=0;x<512;x++){
   const u=x/512*Math.PI*2,v=y/256*Math.PI;
   const grain=(Math.sin(x*127.1+y*311.7+index*13.1)*43758.5453)%1;
   const cloud=Math.sin(u*3+Math.cos(v*5)*1.8)+Math.sin(u*7-v*6)*.45+Math.sin(u*13+v*11)*.18;
   const bands=Math.sin(v*(index===3?32:18)+Math.sin(u*3)*.7)*.06;
   let shade=.88+cloud*.085+grain*.035+bands;
   if(index===0||index===4)shade+=Math.max(0,cloud-.4)*.16;
   if(index===8)shade=1+cloud*.045+grain*.045;
   const offset=(y*512+x)*4;pixels.data[offset]=Math.min(255,red*shade);pixels.data[offset+1]=Math.min(255,green*shade);pixels.data[offset+2]=Math.min(255,blue*shade);pixels.data[offset+3]=255;
  }
  context.putImageData(pixels,0,0);const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;ownedTextures.add(texture);return texture;
 }
 function createScene(){
  renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.65));renderer.setClearColor(0x000000,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.domElement.className='domain-world-canvas';renderer.domElement.setAttribute('aria-hidden','true');stage.prepend(renderer.domElement);
  scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(42,1,.1,80);world=new THREE.Group();scene.add(world);
  scene.add(new THREE.AmbientLight('#b9c6e2',.55));const light=new THREE.DirectionalLight('#fff0db',2.8);light.position.set(-3,6,5);scene.add(light);const fill=new THREE.DirectionalLight('#8aafe5',.65);fill.position.set(5,-1,-4);scene.add(fill);
  const sunlight=new THREE.PointLight('#e9c69a',3,12,1.5);world.add(sunlight);
  mesh(new THREE.SphereGeometry(.57,48,32),ownMaterial(new THREE.MeshStandardMaterial({map:surfaceTexture(8),emissive:'#c3a077',emissiveIntensity:.16,roughness:.95})));
  const glowCanvas=document.createElement('canvas');glowCanvas.width=128;glowCanvas.height=128;const context=glowCanvas.getContext('2d');
  if(context){const gradient=context.createRadialGradient(64,64,10,64,64,64);gradient.addColorStop(0,'rgba(222,189,141,.2)');gradient.addColorStop(.3,'rgba(222,174,114,.075)');gradient.addColorStop(1,'rgba(222,174,114,0)');context.fillStyle=gradient;context.fillRect(0,0,128,128);const texture=new THREE.CanvasTexture(glowCanvas);ownedTextures.add(texture);const glow=new THREE.Sprite(ownMaterial(new THREE.SpriteMaterial({map:texture,color:'#e6c59b',transparent:true,blending:THREE.AdditiveBlending,depthWrite:false})));glow.scale.setScalar(3.8);world.add(glow);}
  const dustPositions=[];for(let i=0;i<110;i++){const angle=i*2.399963,radius=6+((Math.sin(i*78.23)*43758.5)%1+1)*3;dustPositions.push(Math.cos(angle)*radius,Math.sin(i*9.1)*3,Math.sin(angle)*radius);}
  const dustGeometry=ownGeometry(new THREE.BufferGeometry());dustGeometry.setAttribute('position',new THREE.Float32BufferAttribute(dustPositions,3));world.add(new THREE.Points(dustGeometry,ownMaterial(new THREE.PointsMaterial({color:'#a8b8d3',size:.018,transparent:true,opacity:.36,sizeAttenuation:true,depthWrite:false}))));
  domains.forEach((node,index)=>{
   const material=ownMaterial(new THREE.MeshStandardMaterial({map:surfaceTexture(index),emissive:colors[index],emissiveIntensity:.012,metalness:.02,roughness:index===3?.8:.92}));
   const point=mesh(new THREE.SphereGeometry(orbitalLayout[index].size,40,28),material);point.position.copy(positions.get(node.id));point.rotation.set(.1+index*.15,index*.6,.12);point.userData.domainId=node.id;nodeMeshes.set(node.id,point);points.push(point);
   if(index===3){const ring=mesh(new THREE.RingGeometry(orbitalLayout[index].size*1.38,orbitalLayout[index].size*2,64),ownMaterial(new THREE.MeshStandardMaterial({color:'#c7b393',transparent:true,opacity:.45,roughness:1,side:THREE.DoubleSide,depthWrite:false})),point);ring.rotation.set(-Math.PI*.36,.15,.2);}
   const line=new THREE.Line(ownGeometry(new THREE.BufferGeometry().setFromPoints(orbitalPath(index))),ownMaterial(new THREE.LineBasicMaterial({color:'#9dabc3',transparent:true,opacity:.105})));world.add(line);domainLines.set(node.id,line);
  });
  root.dataset.domainRender='3d';fallback.hidden=true;mode.textContent='生活星系 · 3D';setTheme();resize();
 }
 function setTheme(){updateSelection();invalidate();}
 function setCamera(){if(!camera)return;spherical.set(orbit.distance,orbit.polar,orbit.azimuth);camera.position.setFromSpherical(spherical);camera.lookAt(0,.1,0);camera.updateMatrixWorld();}
 function fittedDistance(){return Math.max(initial.distance,12.6/(2*Math.tan(21*Math.PI/180)*width/height));}
 function updateFallback(){
  fallback.setAttribute('viewBox','0 0 '+width+' '+height);fallbackCamera.aspect=width/height;fallbackCamera.position.setFromSpherical(spherical.set(fittedDistance(),initial.polar,initial.azimuth));fallbackCamera.lookAt(0,.1,0);fallbackCamera.updateProjectionMatrix();fallbackCamera.updateMatrixWorld();
  const pixels=height/(2*Math.tan(21*Math.PI/180)*fittedDistance());
  projected.set(0,0,0).project(fallbackCamera);fallbackSun.setAttribute('cx',(projected.x*.5+.5)*width);fallbackSun.setAttribute('cy',(-projected.y*.5+.5)*height);fallbackSun.setAttribute('r',.57*pixels);
  domains.forEach((node,index)=>{
   const path=orbitalPath(index).map(point=>{point.project(fallbackCamera);return (point.x*.5+.5)*width+','+(-point.y*.5+.5)*height;});fallbackPaths.get(node.id).setAttribute('points',path.join(' '));
   projected.copy(positions.get(node.id)).project(fallbackCamera);const sphere=fallbackSpheres.get(node.id);sphere.setAttribute('cx',(projected.x*.5+.5)*width);sphere.setAttribute('cy',(-projected.y*.5+.5)*height);sphere.setAttribute('r',orbitalLayout[index].size*pixels*(selected?.id===node.id?1.1:1));
  });
 }
 function placeLabels(){
  const placements=[],viewCamera=camera||fallbackCamera;
  if(!camera)updateFallback();
  projected.set(0,0,0).project(viewCamera);const centerX=(projected.x*.5+.5)*width,centerY=(-projected.y*.5+.5)*height;
  domains.forEach((node,index)=>{
   const pin=pins.get(node.id);let x,y,depth=0;
   projected.copy(positions.get(node.id)).project(viewCamera);x=(projected.x*.5+.5)*width;y=(-projected.y*.5+.5)*height;depth=projected.z;
   const w=pin.offsetWidth||66,h=pin.offsetHeight||28;
   const radius=height/(2*Math.tan(21*Math.PI/180)*viewCamera.position.distanceTo(positions.get(node.id)))*orbitalLayout[index].size*(node.id===selected?.id?1.1:1);
   placements.push({node,pin,x,y,w,h,depth,radius});
  });
  const placed=[],spheres=[...placements,{x:centerX,y:centerY,radius:height/(2*Math.tan(21*Math.PI/180)*viewCamera.position.length())*.65}];
  // Pick a clear nearby label position while reserving every sphere's silhouette.
  for(const point of [...placements].sort((a,b)=>(b.node.id===selected?.id)-(a.node.id===selected?.id)||a.y-b.y)){
   let best=null;const preferred=Math.atan2(point.y-centerY,point.x-centerX);
   for(const distance of [point.radius+22,point.radius+40,point.radius+62,point.radius+86])for(const angleOffset of [0,.55,-.55,1.1,-1.1,1.65,-1.65,Math.PI]){
    const angle=preferred+angleOffset;
    const x=THREE.MathUtils.clamp(point.x+Math.cos(angle)*distance,point.w/2+10,width-point.w/2-10),y=THREE.MathUtils.clamp(point.y+Math.sin(angle)*distance,point.h/2+12,height-point.h/2-12);
    let penalty=Math.hypot(x-point.x,y-point.y)+Math.abs(angleOffset)*4;
    for(const other of placed){const ox=(point.w+other.w)/2+8-Math.abs(x-other.labelX),oy=(point.h+other.h)/2+7-Math.abs(y-other.labelY);if(ox>0&&oy>0)penalty+=10000+ox*oy;}
    for(const other of spheres){const dx=Math.max(0,Math.abs(x-other.x)-point.w/2),dy=Math.max(0,Math.abs(y-other.y)-point.h/2);if(Math.hypot(dx,dy)<other.radius+7)penalty+=8000;}
    if(!best||penalty<best.penalty)best={x,y,penalty};
   }
   point.labelX=best.x;point.labelY=best.y;placed.push(point);
  }
  for(const point of placements){point.pin.style.left=point.labelX+'px';point.pin.style.top=point.labelY+'px';point.pin.style.zIndex=String(30-Math.round(point.depth*10));point.pin.style.setProperty('--domain-depth-opacity',point.node.id===selected?.id?'1':'.88');const line=leaderLines.get(point.node.id),dx=point.labelX-point.x,dy=point.labelY-point.y,length=Math.max(1,Math.hypot(dx,dy));line.setAttribute('x1',point.x+dx/length*(point.radius+3));line.setAttribute('y1',point.y+dy/length*(point.radius+3));line.setAttribute('x2',point.labelX);line.setAttribute('y2',point.labelY);}
  me.style.left=centerX+'px';me.style.top=centerY+'px';
 }
 function draw(time=0){
  frame=0;if(disposed||!visible||document.hidden)return;
  if(renderer){if(autoRotate&&!reduced.matches&&!drag){const elapsed=lastTime?Math.min(.05,(time-lastTime)/1000):0;elapsedOrbit+=elapsed*.1;domains.forEach((node,index)=>{positions.get(node.id).copy(orbitalPoint(index,orbitalLayout[index].phase+elapsedOrbit*(1-index*.055)));nodeMeshes.get(node.id).position.copy(positions.get(node.id));});updateConnections();}setCamera();renderer.render(scene,camera);}
  placeLabels();lastTime=time;
  if(renderer&&autoRotate&&!reduced.matches)frame=requestAnimationFrame(draw);
 }
 function invalidate(){if(disposed||!visible||document.hidden||frame)return;frame=requestAnimationFrame(draw);}
 function resize(){const previousFit=fittedDistance();width=Math.max(260,stage.clientWidth);height=Math.max(360,stage.clientHeight);orbit.distance=THREE.MathUtils.clamp(orbit.distance*fittedDistance()/previousFit,9,28);leaders.setAttribute('viewBox','0 0 '+width+' '+height);if(renderer){renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();}invalidate();}
 function zoom(factor){if(!renderer)return;orbit.distance=THREE.MathUtils.clamp(orbit.distance*factor,9,28);invalidate();}
 function resetView(){Object.assign(orbit,initial);orbit.distance=fittedDistance();elapsedOrbit=0;domains.forEach((node,index)=>{positions.get(node.id).copy(orbitalPoint(index));nodeMeshes.get(node.id)?.position.copy(positions.get(node.id));});updateConnections();invalidate();}
 function fallbackView(){camera=null;root.dataset.domainRender='2d';mode.textContent='生活星系 · 平面示意';fallback.hidden=false;auto.disabled=true;zoomIn.disabled=true;zoomOut.disabled=true;help.textContent='选择一颗领域行星，查看它与生活及其他领域的联系。';resize();}
 zoomIn.addEventListener('click',()=>zoom(.88),{signal});zoomOut.addEventListener('click',()=>zoom(1/.88),{signal});reset.addEventListener('click',resetView,{signal});
 auto.addEventListener('click',()=>{if(reduced.matches||!renderer)return;autoRotate=!autoRotate;auto.setAttribute('aria-pressed',String(autoRotate));auto.textContent=autoRotate?'暂停公转':'自动公转';lastTime=0;invalidate();},{signal});
 stage.addEventListener('wheel',event=>{if(!renderer)return;event.preventDefault();zoom(Math.exp(event.deltaY*.0007));},{passive:false,signal});
 stage.addEventListener('pointerdown',event=>{if(!renderer||event.button!==0||event.target.closest('button'))return;drag={id:event.pointerId,x:event.clientX,y:event.clientY,azimuth:orbit.azimuth,polar:orbit.polar,moved:false};stage.setPointerCapture(event.pointerId);stage.classList.add('is-dragging');},{signal});
 stage.addEventListener('pointermove',event=>{if(!drag||event.pointerId!==drag.id)return;const dx=event.clientX-drag.x,dy=event.clientY-drag.y;if(Math.hypot(dx,dy)>4)drag.moved=true;orbit.azimuth=drag.azimuth-dx*.006;orbit.polar=THREE.MathUtils.clamp(drag.polar-dy*.005,.45,2.55);invalidate();},{signal});
 const endDrag=event=>{if(!drag||event.pointerId!==drag.id)return;const moved=drag.moved;if(stage.hasPointerCapture(event.pointerId))stage.releasePointerCapture(event.pointerId);drag=null;stage.classList.remove('is-dragging');if(!moved&&camera){const rect=stage.getBoundingClientRect();mouse.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(mouse,camera);const hit=raycaster.intersectObjects(points)[0];if(hit)select(byId.get(hit.object.userData.domainId));}invalidate();};
 stage.addEventListener('pointerup',endDrag,{signal});stage.addEventListener('pointercancel',event=>{if(drag?.id===event.pointerId){drag=null;stage.classList.remove('is-dragging');}},{signal});
 stage.addEventListener('keydown',event=>{if(event.target!==stage||!renderer)return;const delta={ArrowLeft:[-.13,0],ArrowRight:[.13,0],ArrowUp:[0,-.12],ArrowDown:[0,.12]}[event.key];if(delta){event.preventDefault();orbit.azimuth+=delta[0];orbit.polar=THREE.MathUtils.clamp(orbit.polar+delta[1],.45,2.55);invalidate();}else if(['+','=','-','0'].includes(event.key)){event.preventDefault();if(event.key==='0')resetView();else zoom(event.key==='-'?1/.88:.88);}},{signal});
 stage.addEventListener('webglcontextlost',event=>{event.preventDefault();cancelAnimationFrame(frame);frame=0;autoRotate=false;auto.setAttribute('aria-pressed','false');auto.textContent='自动公转';renderer?.domElement.remove();renderer?.dispose();renderer=null;fallbackView();},{signal,capture:true});
 const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(stage);
 const themeObserver=new MutationObserver(setTheme);themeObserver.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
 const intersection=typeof IntersectionObserver==='function'?new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting??true;if(visible){lastTime=0;invalidate();}else{cancelAnimationFrame(frame);frame=0;}},{rootMargin:'80px'}):null;intersection?.observe(root);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else{lastTime=0;invalidate();}},{signal});
 reduced.addEventListener('change',()=>{auto.disabled=reduced.matches||!renderer;auto.title=reduced.matches?'已遵循减少动态效果偏好，仍可手动旋转。':'';if(reduced.matches){autoRotate=false;auto.setAttribute('aria-pressed','false');auto.textContent='自动公转';}invalidate();},{signal});
 try{createScene();resetView();}catch{renderer?.domElement.remove();renderer?.dispose();renderer=null;fallbackView();}
 if(selected)select(selected);else detail.append(make('p',{},'暂时没有领域内容。'));
 return{destroy(){if(disposed)return;disposed=true;cancelAnimationFrame(frame);abort.abort();resizeObserver.disconnect();themeObserver.disconnect();intersection?.disconnect();for(const link of activeLinks){link.geometry.dispose();link.material.dispose();}for(const geometry of ownedGeometries)geometry.dispose();for(const material of ownedMaterials)material.dispose();for(const texture of ownedTextures)texture.dispose();renderer?.forceContextLoss();renderer?.dispose();renderer?.domElement.remove();root.remove();}};
}
