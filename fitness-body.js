import * as THREE from 'three';
import {OrbitControls} from './assets/body/OrbitControls.js';

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const groups = [
  {id:'chest',name:'胸大肌',en:'Pectoralis major',region:'胸',description:'覆盖胸前的扇形肌肉。使上臂向身体中线靠拢，并参与肩关节内旋。',action:'肩水平内收、内收与内旋',examples:'卧推、俯卧撑、夹胸'},
  {id:'deltoid',name:'三角肌',en:'Deltoid',region:'肩',description:'包覆肩关节的肌肉，包含前、中、后三部分。不同部分在举臂方向上的作用不同。',action:'肩外展；前部参与屈曲，后部参与伸展',examples:'推举、侧平举、反向飞鸟'},
  {id:'biceps',name:'肱二头肌',en:'Biceps brachii',region:'臂',description:'位于上臂前侧，有长头与短头。除了屈肘，也能让前臂旋后，使手掌朝上。',action:'屈肘、前臂旋后',examples:'哑铃弯举、上斜弯举、反手引体'},
  {id:'triceps',name:'肱三头肌',en:'Triceps brachii',region:'臂',description:'位于上臂后侧，由长头、外侧头与内侧头构成，是伸肘的主要肌肉。',action:'伸肘；长头也跨过肩关节',examples:'绳索下压、过顶臂屈伸、窄距卧推'},
  {id:'lats',name:'背阔肌',en:'Latissimus dorsi',region:'背',description:'位于背部与躯干两侧的宽大肌肉。把举起的上臂拉向身体，并参与肩关节内旋。',action:'肩内收、伸展与内旋',examples:'引体向上、高位下拉、划船'},
  {id:'trapezius',name:'斜方肌',en:'Trapezius',region:'背',description:'从后颈延伸到上背部。上、中、下部共同参与肩胛骨运动与肩带稳定。',action:'肩胛上提、后缩、下压与上回旋',examples:'耸肩、划船、俯卧 Y 举'},
  {id:'abs',name:'腹直肌',en:'Rectus abdominis',region:'腹',description:'位于腹部前侧，左右两条肌腹由白线分开。与其他躯干肌肉协同控制脊柱与骨盆。',action:'躯干屈曲，参与控制骨盆位置',examples:'卷腹、绳索卷腹、反向卷腹'},
  {id:'obliques',name:'腹外斜肌',en:'External oblique',region:'腹',description:'位于腹部两侧，肌纤维向前下方走行。参与躯干旋转、侧屈和腹压维持。',action:'躯干侧屈、对侧旋转与稳定',examples:'绳索伐木、侧桥、抗旋转推'},
  {id:'glutes',name:'臀大肌',en:'Gluteus maximus',region:'臀',description:'臀部表层的强壮肌肉，参与髋关节伸展。在起身、上楼与跑跳时发挥作用。',action:'髋伸展、外旋',examples:'臀推、深蹲、罗马尼亚硬拉'},
  {id:'quads',name:'股四头肌',en:'Quadriceps femoris',region:'腿',description:'大腿前侧肌群，包括股直肌、股外侧肌、股内侧肌与股中间肌。股直肌同时跨越髋、膝关节。',action:'伸膝；股直肌也参与屈髋',examples:'深蹲、腿举、腿屈伸'},
  {id:'hamstrings',name:'腘绳肌',en:'Hamstrings',region:'腿',description:'大腿后侧的股二头肌、半腱肌与半膜肌。多数部分同时跨过髋、膝两个关节。',action:'屈膝；多数部分也参与髋伸展',examples:'罗马尼亚硬拉、腿弯举、北欧挺身'},
  {id:'calves',name:'小腿后群',en:'Gastrocnemius & soleus',region:'小腿',description:'此处显示腓肠肌与比目鱼肌。腓肠肌跨越膝踝，比目鱼肌位于其深层，主要作用于踝关节。',action:'踝跖屈；腓肠肌也参与屈膝',examples:'站姿提踵、坐姿提踵'}
];
const planes = {
  sagittal:{en:'SAGITTAL PLANE',heading:'分为左与右',description:'矢状面将身体分成左右两部分；经过正中线的称为正中矢状面。屈曲与伸展通常在这个平面内进行。',example:'动作联想：深蹲、弯举、向前弓步。',normal:new THREE.Vector3(1,0,0),color:0xb6c6ee,axis:'x'},
  coronal:{en:'CORONAL / FRONTAL PLANE',heading:'分为前与后',description:'冠状面也称额状面，将身体分成前后两部分。外展与内收通常在这个平面内进行。',example:'动作联想：侧平举、开合跳、侧向弓步。',normal:new THREE.Vector3(0,0,1),color:0xe9b97e,axis:'z'},
  transverse:{en:'TRANSVERSE / HORIZONTAL PLANE',heading:'分为上与下',description:'水平面也称横断面，将身体分成上下两部分。躯干旋转和肩水平内收、外展通常在这个平面内进行。',example:'动作联想：躯干转体、夹胸、反向飞鸟。',normal:new THREE.Vector3(0,1,0),color:0x91d5c2,axis:'y'}
};

let selected='chest', planeId='sagittal', meshes=[], model, scene, renderer, camera, controls;
let planeVisual, planeBorder, clipPlane, bounds, idle=true, manifestData;
let muscleEntries=[], activeParts=new Set(), selectedPart=null;
const bundleLoads=new Map();
const canvas=$('#body-canvas'), stage=$('#body-stage');
const state={ready:false,selected,plane:planeId,clipped:false,layers:{bone:true,muscle:true,skin:false},meshCount:0,triangleCount:0};
// Read-only diagnostic state is useful when checking the local preview.
window.fitnessBody=state;

function renderGroups(){
$('#muscle-list').replaceChildren();
for(const group of groups){
  const button=document.createElement('button');
  button.type='button';button.dataset.muscle=group.id;button.setAttribute('aria-pressed',String(group.id===selected));
  const name=document.createElement('span');name.textContent=group.name;
  const region=document.createElement('small');region.textContent=group.region;
  button.append(name,region);button.addEventListener('click',()=>selectMuscle(group.id));$('#muscle-list').append(button);
}
filterGroups();
}
function filterGroups(){
  const q=$('#muscle-search').value.trim().toLowerCase(),region=$('#muscle-region').value;let count=0;
  for(const group of groups){
    const parts=muscleEntries.filter(e=>e.group===group.id);
    const found=(region==='all'||parts.some(e=>e.region===region))&&(group.name+group.en+group.region+parts.map(e=>e.name+e.en+e.id+e.concept).join('')).toLowerCase().includes(q);
    $(`[data-muscle="${group.id}"]`).hidden=!found;if(found)count++;
  }
  $('#muscle-empty').hidden=count>0;
}
$('#muscle-search').addEventListener('input',filterGroups);
$('#muscle-region').addEventListener('change',filterGroups);
renderGroups();
function renderParts(){
  const container=$('#body-parts');container.replaceChildren();
  for(const entry of muscleEntries.filter(e=>e.group===selected)){
    const row=document.createElement('label');row.className='body-part';
    const input=document.createElement('input');input.type='checkbox';input.checked=activeParts.has(entry.id);input.dataset.part=entry.id;input.setAttribute('aria-label',`显示 ${entry.name} ${entry.id}`);
    const text=document.createElement('span');text.textContent=entry.name;
    const code=document.createElement('small');code.textContent=`${entry.id} · ${entry.concept}`;text.append(code);
    input.addEventListener('change',()=>{if(input.checked)activeParts.add(entry.id);else activeParts.delete(entry.id);syncPartControls();updateLayerVisibility();ensureVisibleBundles();});
    row.append(input,text);if(selectedPart===entry.id)row.classList.add('selected');container.append(row);
  }
}
function selectMuscle(id,partId=null){
  selected=id;selectedPart=partId;state.selected=id;state.selectedPart=partId;
  const group=groups.find(group=>group.id===id);
  $$('[data-muscle]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.muscle===id)));
  if(group){
    $('#muscle-name').textContent=group.name;$('#muscle-en').textContent=group.en;$('#muscle-description').textContent=group.description;
    $('#muscle-function').textContent=group.action;$('#muscle-examples').textContent=group.examples;
    const parts=muscleEntries.filter(e=>e.group===id),available=parts.length>0;
    $('#muscle-scope').textContent=manifestData&&!available?'当前来源未包含这块肌肉的独立网格；此条提供位置与动作文字说明。':partId?`当前网格：${parts.find(e=>e.id===partId)?.name} · ${partId}。下方可逐个隐藏或显示。`:`${parts.length} 个独立网格部件；可分别控制左右侧、肌头与分部。示例动作通常由多块肌肉协同完成。`;
    if(!state.layers.muscle){$('[data-layer="muscle"]').checked=true;setLayer('muscle',true);}
    for(const entry of parts)activeParts.add(entry.id);
    syncPartControls();renderParts();updateLayerVisibility();ensureVisibleBundles();
  }
  for(const mesh of meshes){
    if(mesh.userData.layer!=='muscle')continue;
    const active=partId?mesh.userData.id===partId:mesh.userData.group===id;
    mesh.material.color.set(active?0xe1a34b:mesh.userData.color);
    mesh.material.emissive.set(active?0x542606:0x000000);
    mesh.material.emissiveIntensity=active?.4:0;
  }
  if(!group)$('#body-parts').replaceChildren();
  invalidate();
}
$('#body-clear').addEventListener('click',()=>{selectMuscle(null);$('#muscle-scope').textContent='已取消高亮。点击模型或名称，选择一个肌群。';});
function setLayer(layer,visible){
  state.layers[layer]=visible;
  updateLayerVisibility();
  syncPartControls();ensureVisibleBundles();
  invalidate();
}
function updateLayerVisibility(){
  const opaqueSkin=state.layers.skin&&Number($('#skin-opacity').value)>=100;
  for(const mesh of meshes)mesh.visible=state.layers[mesh.userData.layer]&&(mesh.userData.layer!=='muscle'||activeParts.has(mesh.userData.id))&&(mesh.userData.layer==='skin'||!opaqueSkin);
  state.visibleMuscleParts=meshes.filter(m=>m.visible&&m.userData.layer==='muscle').length;
  invalidate();
}
$$('[data-layer]').forEach(input=>input.addEventListener('change',()=>setLayer(input.dataset.layer,input.checked)));
$('#layer-depth').addEventListener('input',event=>{
  activeParts=new Set(muscleEntries.slice(0,Number(event.target.value)).map(e=>e.id));
  $('[data-layer="muscle"]').checked=true;state.layers.muscle=true;
  syncPartControls();renderParts();updateLayerVisibility();ensureVisibleBundles();
});
function syncPartControls(){
  const count=activeParts.size,total=muscleEntries.length;
  $('#layer-depth').max=total;$('#layer-depth').value=count;
  $('#layer-depth-label').textContent=`${count} / ${total}`;
  $('#body-decrease').disabled=count===0;$('#body-increase').disabled=count===total;
  state.activeMuscleParts=count;state.musclePartCount=total;
}
function stepParts(direction){
  if(direction>0){const next=muscleEntries.find(e=>!activeParts.has(e.id));if(next)activeParts.add(next.id);}
  else {const last=[...muscleEntries].reverse().find(e=>activeParts.has(e.id));if(last)activeParts.delete(last.id);}
  $('[data-layer="muscle"]').checked=true;state.layers.muscle=true;
  syncPartControls();renderParts();updateLayerVisibility();ensureVisibleBundles();
}
$('#body-increase').addEventListener('click',()=>stepParts(1));$('#body-decrease').addEventListener('click',()=>stepParts(-1));
$('#body-bones-only').addEventListener('click',()=>{activeParts.clear();$('[data-layer="bone"]').checked=true;state.layers.bone=true;$('[data-layer="skin"]').checked=false;state.layers.skin=false;syncPartControls();renderParts();updateLayerVisibility();ensureVisibleBundles();});
$('#body-all-muscles').addEventListener('click',()=>{activeParts=new Set(muscleEntries.map(e=>e.id));$('[data-layer="muscle"]').checked=true;state.layers.muscle=true;syncPartControls();renderParts();updateLayerVisibility();ensureVisibleBundles();});
$('#body-isolate').addEventListener('click',()=>{activeParts=new Set(muscleEntries.filter(e=>e.group===selected).map(e=>e.id));$('[data-layer="muscle"]').checked=true;state.layers.muscle=true;syncPartControls();renderParts();updateLayerVisibility();ensureVisibleBundles();});
$('#body-show-group').addEventListener('click',()=>selectMuscle(selected));
$('#skin-opacity').addEventListener('input',event=>{
  const opacity=Number(event.target.value)/100;$('#skin-value').textContent=`${event.target.value}%`;
  for(const mesh of meshes)if(mesh.userData.layer==='skin')mesh.material.opacity=opacity;
  updateLayerVisibility();
  invalidate();
});
function invalidate(){idle=false;}

function setPlane(id){
  planeId=id;state.plane=id;const data=planes[id];
  $$('[data-plane]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.plane===id)));
  $('#plane-en').textContent=data.en;$('#plane-heading').textContent=data.heading;
  $('#plane-description').textContent=data.description;$('#plane-example').textContent=data.example;
  $('#plane-position').value=0;updatePlane();
}
$$('[data-plane]').forEach(button=>button.addEventListener('click',()=>setPlane(button.dataset.plane)));
function updatePlane(){
  const data=planes[planeId],ratio=Number($('#plane-position').value)/100;
  $('#plane-value').textContent=ratio===0?'中间':`${ratio>0?'+':''}${Math.round(ratio*100)}%`;
  if(!planeVisual||!bounds)return;
  const size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
  const offset=center[data.axis]+ratio*size[data.axis]/2;
  planeVisual.position.copy(center);planeVisual.position[data.axis]=offset;
  planeVisual.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),data.normal);
  planeVisual.material.color.set(data.color);planeBorder.material.color.set(data.color);
  planeVisual.visible=$('#plane-visible').checked;
  clipPlane.normal.copy(data.normal);clipPlane.constant=-offset;
  state.clipped=$('#plane-clip').checked;
  for(const mesh of meshes){mesh.material.clippingPlanes=state.clipped?[clipPlane]:[];mesh.material.needsUpdate=true;}
  invalidate();
}
$('#plane-visible').addEventListener('change',updatePlane);$('#plane-clip').addEventListener('change',updatePlane);$('#plane-position').addEventListener('input',updatePlane);

function setView(view){
  if(!camera||!bounds)return;
  const target=bounds.getCenter(new THREE.Vector3()),distance=2.95;
  const directions={front:[0,.03,1],back:[0,.03,-1],left:[1,.03,0],right:[-1,.03,0]};
  camera.position.copy(target).add(new THREE.Vector3(...directions[view]).multiplyScalar(distance));
  controls.target.copy(target);controls.update();
  $$('[data-view]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.view===view)));
  $('#body-view-label').textContent=({front:'前视图',back:'后视图',left:'人体左侧',right:'人体右侧'})[view];invalidate();
}
$$('[data-view]').forEach(button=>button.addEventListener('click',()=>setView(button.dataset.view)));
$('#body-reset').addEventListener('click',()=>{if(controls){controls.autoRotate=false;$('#body-rotate').setAttribute('aria-pressed','false');setView('front');}});
$('#body-rotate').addEventListener('click',()=>{if(controls){controls.autoRotate=!controls.autoRotate;$('#body-rotate').setAttribute('aria-pressed',String(controls.autoRotate));invalidate();}});

function showError(message){
  const loading=$('#body-loading');loading.hidden=false;loading.replaceChildren();
  const title=document.createElement('strong');title.className='body-error';title.textContent='三维模型暂时无法显示';
  const note=document.createElement('span');note.textContent=message;
  const retry=document.createElement('button');retry.type='button';retry.className='body-retry';retry.textContent='重新加载';retry.addEventListener('click',()=>location.reload());
  loading.append(title,note,retry);state.error=message;
}

async function loadBundle(id){
  if(bundleLoads.has(id))return bundleLoads.get(id);
  const promise=(async()=>{
    const bundle=manifestData.bundles.find(b=>b.id===id);
    const response=await fetch(`assets/body/${bundle.url}`);if(!response.ok)throw new Error(`${bundle.name}模型资源读取失败。`);
    if(!('DecompressionStream' in window))throw new Error('请使用支持压缩流的现代浏览器读取分区网格。');
    const buffer=await new Response(response.body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
    for(const entry of manifestData.meshes.filter(e=>e.bundle===id)){
      const geometry=new THREE.BufferGeometry();
      geometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(buffer,entry.positionOffset,entry.vertexCount*3),3));
      geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(buffer,entry.indexOffset,entry.indexCount),1));geometry.computeVertexNormals();geometry.computeBoundingSphere();
      const color=entry.layer==='bone'?0xe0d1b3:entry.layer==='skin'?0xcda17f:({chest:0xb76b60,deltoid:0xb47769,biceps:0xac6a58,triceps:0x9f5e53,trapezius:0xb27368,obliques:0x9d6557,glutes:0xaf6c5d,quads:0xb06b58,hamstrings:0xa76457,calves:0xaa6e60})[entry.group]||0xa76b60;
      const material=new THREE.MeshStandardMaterial({color,roughness:.7,metalness:0,side:THREE.DoubleSide,transparent:entry.layer==='skin',opacity:entry.layer==='skin'?Number($('#skin-opacity').value)/100:1,depthWrite:entry.layer!=='skin',clippingPlanes:state.clipped&&clipPlane?[clipPlane]:[]});
      const mesh=new THREE.Mesh(geometry,material);mesh.userData={...entry,color};mesh.renderOrder=entry.layer==='skin'?5:0;
      const highlighted=selectedPart?entry.id===selectedPart:entry.group===selected;
      if(entry.layer==='muscle'&&highlighted){material.color.set(0xe1a34b);material.emissive.set(0x542606);material.emissiveIntensity=.4;}
      meshes.push(mesh);model.add(mesh);
    }
    state.loadedBundles=[...bundleLoads.keys()];state.meshCount=meshes.length;
    updateLayerVisibility();invalidate();
  })();
  bundleLoads.set(id,promise);
  promise.catch(()=>bundleLoads.delete(id));
  return promise;
}
async function ensureVisibleBundles(){
  if(!manifestData||!model)return;
  const needed=new Set(manifestData.meshes.filter(e=>state.layers[e.layer]&&(e.layer!=='muscle'||activeParts.has(e.id))).map(e=>e.bundle));
  const fresh=[...needed].filter(id=>!bundleLoads.has(id));
  if(fresh.length)$('#body-part-status').textContent=`正在读取 ${fresh.map(id=>manifestData.bundles.find(b=>b.id===id).name).join('、')}…`;
  state.loading=true;
  try{
    await Promise.all([...needed].map(loadBundle));
    updateLayerVisibility();
    $('#body-part-status').textContent=`显示 ${state.visibleMuscleParts} / ${muscleEntries.length} 个肌肉部件 · 皮肤按需加载`;
  }catch(error){$('#body-part-status').textContent=error.message+' 可刷新后重试。';state.loadError=error.message;}
  finally{state.loading=false;}
}

async function init(){
  try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});}catch{showError('当前浏览器未提供 WebGL。请启用硬件加速，或使用支持 WebGL 的浏览器。肌群文字与平面说明仍可阅读。');return;}
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.localClippingEnabled=true;
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.45;
  scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(39,1,.01,30);
  scene.add(new THREE.HemisphereLight(0xf4f1e8,0x606d7d,2.3));
  for(const [color,intensity,position] of [[0xffe5cc,3,[3,4,5]],[0xc5d9ff,2,[-3,1,2]],[0xffffff,2,[0,3,-4]]]){const light=new THREE.DirectionalLight(color,intensity);light.position.set(...position);scene.add(light);}
  controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.dampingFactor=.08;controls.minDistance=1;controls.maxDistance=7;controls.enablePan=true;controls.autoRotateSpeed=.9;
  controls.addEventListener('change',()=>{invalidate();});
  controls.addEventListener('start',()=>{$$('[data-view]').forEach(button=>button.setAttribute('aria-pressed','false'));$('#body-view-label').textContent='自由观察';});
  model=new THREE.Group();scene.add(model);
  const manifestResponse=await fetch('assets/body/models.json');if(!manifestResponse.ok)throw new Error('模型清单读取失败，请刷新重试。');
  const manifest=await manifestResponse.json();manifestData=manifest;
  muscleEntries=manifest.meshes.filter(e=>e.layer==='muscle').sort((a,b)=>a.order-b.order);
  activeParts=new Set(muscleEntries.map(e=>e.id));syncPartControls();
  for(const region of manifest.regions){const option=document.createElement('option');option.value=region.id;option.textContent=region.name;$('#muscle-region').append(option);}
  for(const entry of muscleEntries){
    if(groups.some(g=>g.id===entry.group))continue;
    const region=manifest.regions.find(r=>r.id===entry.region)?.name||'其他';
    groups.push({id:entry.group,name:entry.name.replace(/^[左右]/,'').split(' · ')[0],en:entry.en.replace(/\b(left|right)\b/g,'').trim(),region,description:`${region}的骨骼肌网格，名称对应下方英文 FMA 概念。可在模型上选中，并分别显示左右侧与来源部件。`,action:'此项用于辨认位置、形态与相邻结构。',examples:'具体动作请结合训练方法与专业解剖资料理解。'});
  }
  renderGroups();
  $('#body-load-progress').textContent=`读取分区网格 · ${muscleEntries.length} 个肌肉部件`;
  await ensureVisibleBundles();if(state.loadError)throw new Error(state.loadError);
  bounds=new THREE.Box3().setFromObject(model);
  // All region bundles share the same anatomical frame and scale.
  const extent=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
  const planeGeometry=new THREE.PlaneGeometry(Math.max(1,extent.x*1.5),extent.y*1.09);
  planeVisual=new THREE.Mesh(planeGeometry,new THREE.MeshBasicMaterial({color:0xb6c6ee,side:THREE.DoubleSide,transparent:true,opacity:.12,depthWrite:false}));
  planeBorder=new THREE.LineSegments(new THREE.EdgesGeometry(planeGeometry),new THREE.LineBasicMaterial({color:0xb6c6ee,transparent:true,opacity:.6}));planeVisual.add(planeBorder);scene.add(planeVisual);clipPlane=new THREE.Plane();
  controls.target.copy(center);setView('front');updatePlane();selectMuscle(selected);
  const availableGroups=new Set(manifest.meshes.filter(mesh=>mesh.layer==='muscle').map(mesh=>mesh.group));
  $('#body-model-count').textContent=`BodyParts3D · ${manifest.sourceMeshCount} 个来源部件 · ${muscleEntries.length} 个肌肉部件`;
  $('#body-coverage').textContent=`本页导入 ${muscleEntries.length} 个可核验骨骼肌网格部件、${manifest.meshes.filter(e=>e.layer==='bone').length} 个骨骼部件与 ${manifest.meshes.filter(e=>e.layer==='skin').length} 个皮肤网格，保留左右侧、肌头与分部的独立控制。依据官方 FMA 肌肉器官、肌头、肌区及斜方肌分部映射选择；按身体分区压缩加载。部件数不是独立肌肉的总数。`;
  for(const group of groups)if(!availableGroups.has(group.id)){$(`[data-muscle="${group.id}"] small`).textContent='文字说明';}
  state.meshCount=meshes.length;state.totalMeshCount=manifest.meshes.length;state.triangleCount=manifest.meshes.reduce((sum,m)=>sum+m.indexCount/3,0);state.sourceMeshCount=manifest.sourceMeshCount;state.ready=true;
  selectMuscle(selected);
  $('#body-loading').hidden=true;
  const resize=()=>{const w=stage.clientWidth,h=stage.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();invalidate();};new ResizeObserver(resize).observe(stage);resize();
  let pointerStart;
  canvas.addEventListener('pointerdown',event=>{pointerStart={x:event.clientX,y:event.clientY};});
  canvas.addEventListener('pointerup',event=>{
    if(!pointerStart||Math.hypot(event.clientX-pointerStart.x,event.clientY-pointerStart.y)>6)return;
    const rect=canvas.getBoundingClientRect(),pointer=new THREE.Vector2((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);
    const ray=new THREE.Raycaster();ray.setFromCamera(pointer,camera);
    const hits=ray.intersectObjects(meshes.filter(m=>m.visible&&m.userData.layer==='muscle'));
    const hit=hits.find(hit=>!state.clipped||clipPlane.distanceToPoint(hit.point)>=0);
    if(hit)selectMuscle(hit.object.userData.group,hit.object.userData.id);
  });
  canvas.addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-','Home'].includes(event.key))return;event.preventDefault();
    if(event.key==='Home'){setView('front');return;}
    const offset=camera.position.clone().sub(controls.target),spherical=new THREE.Spherical().setFromVector3(offset);
    if(event.key==='ArrowLeft')spherical.theta-=.14;if(event.key==='ArrowRight')spherical.theta+=.14;
    if(event.key==='ArrowUp')spherical.phi-=.12;if(event.key==='ArrowDown')spherical.phi+=.12;
    if(event.key==='+'||event.key==='=')spherical.radius*=.92;if(event.key==='-')spherical.radius*=1.08;
    spherical.phi=THREE.MathUtils.clamp(spherical.phi,.1,Math.PI-.1);spherical.radius=THREE.MathUtils.clamp(spherical.radius,1,7);
    camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(spherical));controls.update();invalidate();
  });
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();showError('图形上下文已中断。点击重新加载恢复三维模型。');});
  function animate(){requestAnimationFrame(animate);controls.update();if(!idle||controls.autoRotate){renderer.render(scene,camera);idle=true;}}
  animate();
}
init().catch(error=>showError(error.message||'加载失败，请稍后重试。'));
