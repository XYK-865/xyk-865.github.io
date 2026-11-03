const cssURL=new URL('./decision-branch-3d.css',import.meta.url).href;
if(!document.querySelector('link[data-decision-branch-style]')){const link=document.createElement('link');link.rel='stylesheet';link.href=cssURL;link.dataset.decisionBranchStyle='';document.head.append(link);}

// Positions express the decision's forks; depth separates screening, action and review.
const nodes=[
 {id:'problem',title:'遇到一个问题',sub:'说清目标 · 列出选项',step:0,pos:[0,9.5,-.8],kind:'start',body:'先把问题写成一句要决定的事，列出至少两个真实选项，也包括暂时不做。',next:'把每个方案交给硬条件检查；没有可接受的方案时，回到这里找替代方案。'},
 {id:'boundary',title:'硬条件满足吗？',sub:'预算 · 时间 · 损失上限',step:1,pos:[0,6.5,-.8],kind:'gate',body:'先分开不可妥协的条件与普通偏好，逐个排除触碰硬边界的选项。',next:'满足 → 比较证据；不满足 → 调整或另找方案，不能用其他小优点抵消硬边界。'},
 {id:'reframe',title:'退回找方案',sub:'回 01 · 换选项或缩范围',step:0,pos:[-6.0,4.7,.1],kind:'return',body:'这条路暂时走不通。改变方案、缩小范围，或选择暂时不做。',next:'回到 01 更新选项，再重新检查硬条件。'},
 {id:'evidence',title:'证据够判断吗？',sub:'后果 · 风险 · 可逆性',step:2,pos:[0,3.3,-.6],kind:'gate',body:'列出事实、推测与关键未知，比较收益、损失和可逆性。证据要与决定的重要性相称。',next:'够 → 看是否涉及他人；不够 → 先查证。查证也可以是一项有投入上限的小试验。'},
 {id:'research',title:'先查证，再比较',sub:'回 03 · 补关键未知',step:2,pos:[-6.0,1.5,.3],kind:'return',body:'只补可能改变选择的信息：查可靠来源、询问实际情况，或做一次低成本验证。',next:'把新增事实和仍未知的部分带回 03。若查证成本过高，保留未知并缩小试验。'},
 {id:'people',title:'是否涉及他人？',sub:'结果会随对方回应改变吗',step:3,pos:[0,.1,0],kind:'gate',body:'辨认结果是否取决于别人怎么行动、合作或竞争；不用把每个选择都套成博弈。',next:'涉及 → 协商并写可能回应；不涉及 → 自己比较和决定。两条路都汇入小试与退出约定。'},
 {id:'solo',title:'自己决定',sub:'保留当前选择的理由',step:4,pos:[-6.0,-2.6,.7],kind:'action',body:'没有关键的相互依赖时，按自己的目标、证据和损失上限选一个当前方案。',next:'直接进入 05：写下理由，安排最小行动与检查时间。'},
 {id:'cooperate',title:'协商与可能回应',sub:'目标 · 信息 · 可核验约定',step:3,pos:[6.0,-2.6,-.2],kind:'action',body:'写清谁参与、各自在意什么，以及“我这样做 → 对方可能回应 → 我下一步怎样做”。寻找共同利益与可核验的承诺。',next:'约定可执行 → 进入 05；如果回应推翻了原方案，回 03 更新比较。'},
 {id:'trial',title:'小试 + 退出合约',sub:'先留记录，再小步行动',step:4,pos:[0,-5.4,.8],kind:'action',body:'写下当前选择与理由，设定最小行动、后续投入上限、检查时间、退出信号和替代方案。',next:'行动前保留记录。到约定时间或触发退出信号时，进入检查点。'},
 {id:'checkpoint',title:'到了检查点',sub:'对照原判断与新事实',step:5,pos:[0,-8.6,1.0],kind:'gate',body:'对照行动前的证据与真实发生的事，区分判断质量和运气。已付出且无法追回的成本不能单独成为继续的理由。',next:'继续 → 回 05 设新检查点；调整 → 回 03 / 04；退出 → 回 01 选替代方案。'},
 {id:'continue',title:'继续',sub:'回 05 · 设下一检查点',step:4,pos:[-6.0,-11.8,1.6],kind:'continue',body:'新事实支持原判断，且从现在继续投入仍然合算。',next:'回 05 设下一次小步行动、投入上限与检查点。'},
 {id:'adjust',title:'调整',sub:'回 03 / 04 · 更新判断',step:2,pos:[0,-11.8,.8],kind:'return',body:'方向可能仍有价值，但证据、范围或参与者的回应变了。',next:'回 03 重新比较；涉及他人时再进 04 更新约定。'},
 {id:'quit',title:'退出',sub:'回 01 · 选替代方案',step:0,pos:[6.0,-11.8,1.6],kind:'quit',body:'退出信号已经出现，或从现在继续的后果不如其他选择。',next:'停止追加投入，完成必要交接，再回 01 选择替代方案。'}
];
const edges=[
 ['problem','boundary','先筛选'],['boundary','reframe','不满足','return'],['boundary','evidence','满足'],
 ['evidence','research','不够','return'],['evidence','people','够'],
 ['people','solo','不涉及'],['people','cooperate','涉及'],
 ['solo','trial','当前选择'],['cooperate','trial','形成约定'],['trial','checkpoint','行动后检查'],
 ['checkpoint','continue','继续','continue'],['checkpoint','adjust','调整','return'],['checkpoint','quit','退出','quit']
].map(([from,to,label,kind='path'])=>({from,to,label,kind}));
const byId=new Map(nodes.map(node=>[node.id,node]));
const colors={path:0x8a9c8c,return:0xb57f51,continue:0x648a74,quit:0xaf7266};
const el=(tag,cls,text)=>{const item=document.createElement(tag);if(cls)item.className=cls;if(text!==undefined)item.textContent=text;return item;};
const svgEl=(tag,attrs)=>{const item=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [key,value]of Object.entries(attrs))item.setAttribute(key,value);return item;};

export function renderDecisionFlow({container}){
 const controller=new AbortController(),{signal}=controller;
 let destroyed=false,sceneState=null,selected='problem',mode='flat',zoom=1,rotation={x:-.28,y:.30},drag=null,ignoreClickUntil=0;
 const root=el('div','decision-flow-map decision-branch-map');
 const header=el('header');header.append(el('p','decision-branch-eyebrow','DECISION PATHS / 判断的分岔'),el('h3','','遇到问题后，沿条件往下走'),el('p','','每个分叉都是一次判断。条件不成立就先补齐；行动之后，再根据新事实选择继续、调整或退出。'));
 const toolbar=el('div','decision-branch-toolbar'),hint=el('p','','拖动空白处旋转 · 按住 Shift 拖动平移 · 滚轮缩放');
 const controls=el('div','decision-branch-controls');controls.setAttribute('aria-label','决策结构图控制');
 const button=(label,action,aria)=>{const b=el('button','',label);b.type='button';b.dataset.decisionView=action;if(aria)b.setAttribute('aria-label',aria);controls.append(b);return b;};
 const zoomOut=button('−','out','缩小结构图'),zoomValue=el('output','','100%');zoomValue.setAttribute('aria-label','当前缩放');controls.append(zoomValue);
 const zoomIn=button('＋','in','放大结构图');button('重置','reset');const flatButton=button('平面阅读','flat');flatButton.setAttribute('aria-pressed','false');
 toolbar.append(hint,controls);
 const scroller=el('div','decision-branch-scroller'),stage=el('div','decision-branch-stage');stage.tabIndex=0;stage.setAttribute('role','region');stage.setAttribute('aria-label','决策分叉结构图。点击节点查看下一步；方向键旋转，Shift 加方向键平移，加减键缩放，0 重置。');
 const svg=svgEl('svg',{class:'decision-branch-flat','aria-hidden':'true'}),defs=svgEl('defs',{});
 for(const [kind,color]of Object.entries(colors)){const marker=svgEl('marker',{id:'decision-arrow-'+kind,viewBox:'0 0 10 10',refX:'8',refY:'5',markerWidth:'7',markerHeight:'7',orient:'auto-start-reverse'});marker.append(svgEl('path',{d:'M 1 1 L 9 5 L 1 9 z',fill:'#'+color.toString(16).padStart(6,'0')}));defs.append(marker);}svg.append(defs);
 const svgPaths=edges.map(edge=>{const path=svgEl('path',{'data-kind':edge.kind,'marker-end':'url(#decision-arrow-'+edge.kind+')'});svg.append(path);return path;});
 const labelLayer=el('div','decision-branch-labels'),edgeLabels=edges.map(edge=>{const label=el('span','decision-branch-edge-label is-'+edge.kind,edge.label);label.setAttribute('aria-hidden','true');labelLayer.append(label);return label;});
 const nodeButtons=new Map();
 for(const node of nodes){const b=el('button','decision-branch-node is-'+node.kind);b.type='button';b.dataset.decisionNode=node.id;b.setAttribute('aria-pressed','false');b.append(el('strong','',node.title),el('small','',node.sub));labelLayer.append(b);nodeButtons.set(node.id,b);}
 const bands=[['01—03 / 先筛选',[-8.1,10.5,-1.5]],['04—05 / 再行动',[-8.1,-.5,-.5]],['06 / 定期重看',[-8.1,-8.2,.3]]].map(([title,pos])=>{const label=el('span','decision-branch-band',title);labelLayer.append(label);return{label,pos};});
 stage.append(svg,labelLayer);scroller.append(stage);
 const status=el('p','decision-branch-status','正在载入立体结构；也可以用平面阅读。');status.setAttribute('role','status');
 const detail=el('section','decision-flow-detail decision-branch-detail');detail.setAttribute('aria-live','polite');
 const foot=el('p','decision-branch-foot','绿色：可继续往下走　·　暖棕：先补齐或返回　·　节点下的小字标明返回哪一步。');
 root.append(header,toolbar,scroller,status,detail,foot);container.replaceChildren(root);
 const pan={x:0,y:0};let width=800,height=880;

 function select(id){
  selected=id;const node=byId.get(id);
  for(const [key,b]of nodeButtons)b.setAttribute('aria-pressed',String(key===id));
  for(let i=0;i<edges.length;i++)edgeLabels[i].classList.toggle('is-active',edges[i].from===id);
  detail.replaceChildren();const text=el('div');text.append(el('p','kicker','当前节点 · 对应填写 0'+(node.step+1)),el('h4','',node.title),el('p','',node.body),el('p','decision-branch-next','下一步：'+node.next));
  const start=el('button','','去第 0'+(node.step+1)+' 步填写 ↑');start.type='button';start.dataset.decisionStart='';detail.append(text,start);
  if(sceneState){for(const [key,mesh]of sceneState.meshes){mesh.material.color.setHex(key===id?0xd6b18c:(byId.get(key).kind==='gate'?0xe4ece5:0xf0e8dd));}paint();}
 }
 function screen(point){
  if(mode==='3d'&&sceneState){const v=new sceneState.THREE.Vector3(...point);sceneState.group.localToWorld(v);v.project(sceneState.camera);return{x:(v.x+1)*width/2,y:(1-v.y)*height/2};}
  const unit=Math.min((width-106)/17.7,(height-105)/25.0)*zoom;
  return{x:width/2+point[0]*unit+pan.x,y:height/2-(point[1]+.8)*unit+pan.y};
 }
 function edgePoints(edge){
  const a=byId.get(edge.from).pos,b=byId.get(edge.to).pos;
  const start=[a[0],a[1]-.80,a[2]+.18],end=[b[0],b[1]+.82,b[2]+.18];
  const dx=b[0]-a[0];
  return[start,[a[0]+dx*.16,(start[1]+end[1])/2+.25,a[2]+.22],[b[0]-dx*.16,(start[1]+end[1])/2-.25,b[2]+.22],end];
 }
 function paint(){
  if(destroyed)return;
  if(sceneState&&mode==='3d'){
   const s=sceneState;s.group.rotation.set(rotation.x,rotation.y,0);s.group.updateMatrixWorld(true);
   const span=26.8/zoom,aspect=width/height;s.camera.left=-span*aspect/2;s.camera.right=span*aspect/2;s.camera.top=span/2;s.camera.bottom=-span/2;s.camera.position.set(-pan.x*span/height,pan.y*span/height-.8,40);s.camera.lookAt(-pan.x*span/height,pan.y*span/height-.8,0);s.camera.updateProjectionMatrix();s.camera.updateMatrixWorld();s.renderer.render(s.scene,s.camera);
  }
  for(const node of nodes){const p=screen(node.pos),b=nodeButtons.get(node.id);b.style.left=p.x+'px';b.style.top=p.y+'px';}
  edges.forEach((edge,index)=>{const points=edgePoints(edge),a=screen(points[0]),c=screen(points[1]),d=screen(points[2]),b=screen(points[3]);svgPaths[index].setAttribute('d',`M${a.x},${a.y} C${c.x},${c.y} ${d.x},${d.y} ${b.x},${b.y}`);const middle=screen(points.reduce((sum,point,i)=>sum.map((n,j)=>n+point[j]*[.125,.375,.375,.125][i]),[0,0,0]));edgeLabels[index].style.left=(middle.x+(Math.abs(a.x-b.x)<8?26:0)-(['reframe','research'].includes(edge.to)?25:0))+'px';edgeLabels[index].style.top=(middle.y+(['reframe','research'].includes(edge.to)?-32:0))+'px';});
  for(const band of bands){const p=screen(band.pos);band.label.style.left=p.x+'px';band.label.style.top=p.y+'px';}
  zoomValue.value=Math.round(zoom*100)+'%';zoomValue.textContent=zoomValue.value;zoomOut.disabled=zoom<=.75;zoomIn.disabled=zoom>=1.7;
 }
 let centeredWidth=0;
 function resize(){width=stage.clientWidth;height=stage.clientHeight;svg.setAttribute('viewBox',`0 0 ${width} ${height}`);if(sceneState){sceneState.renderer.setSize(width,height,false);}if(centeredWidth!==scroller.clientWidth){scroller.scrollLeft=Math.max(0,(width-scroller.clientWidth)/2);centeredWidth=scroller.clientWidth;}paint();}
 const observer=new ResizeObserver(resize);observer.observe(stage);observer.observe(scroller);
 function setMode(next){mode=next;root.dataset.view=next;if(next==='3d')svg.setAttribute('hidden','');else svg.removeAttribute('hidden');if(sceneState)sceneState.renderer.domElement.hidden=next!=='3d';flatButton.setAttribute('aria-pressed',String(next==='flat'));flatButton.textContent=next==='flat'&&sceneState?'立体结构':'平面阅读';hint.textContent=next==='3d'?'拖动空白处旋转 · Shift 拖动平移 · 滚轮缩放':'按分叉条件阅读 · 点击节点查看下一步';paint();}
 function reset(){zoom=1;pan.x=0;pan.y=0;rotation={x:-.28,y:.30};scroller.scrollLeft=Math.max(0,(stage.clientWidth-scroller.clientWidth)/2);paint();}
 root.addEventListener('click',event=>{
  if(performance.now()<ignoreClickUntil&&event.target.closest('.decision-branch-stage'))return;
  const node=event.target.closest('[data-decision-node]');if(node){select(node.dataset.decisionNode);return;}
  if(event.target.closest('[data-decision-start]')){dispatchEvent(new CustomEvent('decision-step-request',{detail:{step:byId.get(selected).step}}));return;}
  const action=event.target.closest('[data-decision-view]')?.dataset.decisionView;
  if(action==='reset')reset();else if(action==='flat'){if(sceneState){reset();setMode(mode==='3d'?'flat':'3d');}else{reset();setMode('flat');}}else if(action==='in'||action==='out'){zoom=Math.max(.75,Math.min(1.7,zoom*(action==='in'?1.15:1/1.15)));paint();}
 },{signal});
 stage.addEventListener('wheel',event=>{if(!event.ctrlKey&&mode!=='3d')return;event.preventDefault();zoom=Math.max(.75,Math.min(1.7,zoom*Math.exp(-event.deltaY*.001)));paint();},{passive:false,signal});
 stage.addEventListener('pointerdown',event=>{if(event.button!==0||event.pointerType==='touch'||event.target.closest('button'))return;drag={id:event.pointerId,x:event.clientX,y:event.clientY,rx:rotation.x,ry:rotation.y,px:pan.x,py:pan.y,pan:event.shiftKey,moved:false};stage.setPointerCapture(event.pointerId);},{signal});
 stage.addEventListener('pointermove',event=>{if(!drag||drag.id!==event.pointerId)return;const dx=event.clientX-drag.x,dy=event.clientY-drag.y;if(Math.hypot(dx,dy)>4)drag.moved=true;if(!drag.moved)return;if(drag.pan||mode==='flat'){pan.x=drag.px+dx;pan.y=drag.py+dy;}else{rotation.y=Math.max(-.65,Math.min(.65,drag.ry+dx*.004));rotation.x=Math.max(-.45,Math.min(.45,drag.rx+dy*.003));}paint();},{signal});
 const stop=event=>{if(drag?.id!==event.pointerId)return;if(drag.moved)ignoreClickUntil=performance.now()+150;drag=null;if(stage.hasPointerCapture(event.pointerId))stage.releasePointerCapture(event.pointerId);};stage.addEventListener('pointerup',stop,{signal});stage.addEventListener('pointercancel',stop,{signal});
 stage.addEventListener('keydown',event=>{if(event.target!==stage)return;if(event.key==='0'){event.preventDefault();reset();return;}if(['+','=','-'].includes(event.key)){event.preventDefault();zoom=Math.max(.75,Math.min(1.7,zoom*(event.key==='-'?1/1.15:1.15)));paint();return;}const move={ArrowLeft:[-.08,0],ArrowRight:[.08,0],ArrowUp:[0,-.06],ArrowDown:[0,.06]}[event.key];if(!move)return;event.preventDefault();if(event.shiftKey||mode==='flat'){pan.x+=move[0]*400;pan.y+=move[1]*400;}else{rotation.y=Math.max(-.65,Math.min(.65,rotation.y+move[0]));rotation.x=Math.max(-.45,Math.min(.45,rotation.x+move[1]));}paint();},{signal});
 select('problem');setMode('flat');resize();

 // The flat view is already usable while Three loads, and remains if WebGL is unavailable.
 import('../body/three.module.js').then(THREE=>{
  if(destroyed)return;
  let renderer;
  try{
   renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.setSize(width,height,false);renderer.setClearColor(0xffffff,0);renderer.domElement.setAttribute('aria-hidden','true');renderer.domElement.className='decision-branch-canvas';
   const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-10,10,14,-14,.1,100),group=new THREE.Group();scene.add(group);scene.add(new THREE.HemisphereLight(0xffffff,0xb5aa9b,2.0));const light=new THREE.DirectionalLight(0xffffff,2.4);light.position.set(-8,12,20);scene.add(light);
   const meshes=new Map(),resources=[];
   const add=(geometry,material)=>{resources.push(geometry,material);const mesh=new THREE.Mesh(geometry,material);group.add(mesh);return mesh;};
   for(const [y,h,z]of [[6.1,10.7,-1.55],[-2.65,7.5,-.55],[-10.3,6.0,.2]]){
    const material=new THREE.MeshStandardMaterial({color:0xece7dd,roughness:.94,transparent:true,opacity:.58});const shelf=add(new THREE.BoxGeometry(18.3,h,.46),material);shelf.position.set(0,y,z);
    const outlineGeometry=new THREE.EdgesGeometry(shelf.geometry),outlineMaterial=new THREE.LineBasicMaterial({color:0xded7ca,transparent:true,opacity:.72});resources.push(outlineGeometry,outlineMaterial);const outline=new THREE.LineSegments(outlineGeometry,outlineMaterial);outline.position.copy(shelf.position);group.add(outline);
   }
   for(const edge of edges){const points=edgePoints(edge).map(point=>new THREE.Vector3(...point)),curve=new THREE.CubicBezierCurve3(...points),material=new THREE.MeshStandardMaterial({color:colors[edge.kind],roughness:.8}),tube=add(new THREE.TubeGeometry(curve,28,.025,6,false),material);const arrow=add(new THREE.ConeGeometry(.12,.31,12),material);arrow.position.copy(curve.getPoint(.97));arrow.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),curve.getTangent(.97).normalize());tube.renderOrder=1;}
   const shape=new THREE.Shape();const w=3.2,h=.82,r=.18;shape.moveTo(-w/2+r,-h/2);shape.lineTo(w/2-r,-h/2);shape.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);shape.lineTo(w/2,h/2-r);shape.quadraticCurveTo(w/2,h/2,w/2-r,h/2);shape.lineTo(-w/2+r,h/2);shape.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);shape.lineTo(-w/2,-h/2+r);shape.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);
   const geometry=new THREE.ExtrudeGeometry(shape,{depth:.25,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.05,bevelThickness:.05});resources.push(geometry);
   for(const node of nodes){const material=new THREE.MeshStandardMaterial({color:node.id===selected?0xd6b18c:(node.kind==='gate'?0xe4ece5:0xf0e8dd),roughness:.8});resources.push(material);const mesh=new THREE.Mesh(geometry,material);mesh.position.set(node.pos[0],node.pos[1]-.12,node.pos[2]-.15);group.add(mesh);meshes.set(node.id,mesh);}
   sceneState={THREE,scene,camera,group,renderer,meshes,resources};stage.prepend(renderer.domElement);
   renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();setMode('flat');status.textContent='立体视图暂不可用，已切换为可点击的平面分叉图。';},{signal});
   setMode('3d');status.textContent=matchMedia('(prefers-reduced-motion: reduce)').matches?'静止立体视图 · 仅在你操作时更新。':'立体分叉结构 · 点击任意节点，下面会说明接下来怎么办。';
  }catch(error){if(renderer)renderer.dispose();setMode('flat');status.textContent='当前设备使用平面分叉图；全部条件、节点和填写入口仍可用。';flatButton.hidden=true;}
 }).catch(()=>{if(!destroyed){status.textContent='当前使用平面分叉图；全部条件、节点和填写入口仍可用。';flatButton.hidden=true;}});
 return{destroy(){destroyed=true;controller.abort();observer.disconnect();if(sceneState){for(const resource of new Set(sceneState.resources))resource.dispose();sceneState.renderer.dispose();sceneState.renderer.forceContextLoss();sceneState=null;}root.remove();}};
}
