export const KINDS={pathway:{label:'主要路径',color:'#547f9b'},support:{label:'支持 / 调节',color:'#4d8b77'},measurement:{label:'测量 / 反馈',color:'#9479b0'},hypothesis:{label:'假说 / 未定',color:'#a78355'},contrast:{label:'对比',color:'#ae7088'},definition:{label:'定义 / 组成',color:'#7d8792'}};
const norm=s=>String(s).toLowerCase().normalize('NFKC').replace(/[\s_\-]/g,'');
export const LAYOUT={goal:[.05,.5],plan:[.16,.5],method:[.16,.25],dose:[.27,.5],metrics:[.27,.12],mechanics:[.38,.12],tension:[.38,.5],stress:[.32,.76],damage:[.43,.9],sense:[.49,.5],signal:[.60,.5],satellite:[.82,.23],protein:[.71,.5],remodel:[.82,.5],hyp:[.94,.5],track:[.94,.82],creatine:[.06,.85],energy:[.19,.85],food:[.73,.85],rest:[.57,.85]};
const OVERVIEW_LABELS={goal:'目标：肌肥大与力量',plan:'计划与周期化',method:'RPT / 递减组',dose:'训练变量',metrics:'训练指标',mechanics:'动作力学',tension:'机械张力',stress:'代谢应激',damage:'肌肉损伤',sense:'机械信号转导',signal:'mTORC1 / MAPK',satellite:'卫星细胞 / 肌核',protein:'蛋白质净积累',remodel:'肌纤维重塑',hyp:'肌肥大',track:'观察与记录',energy:'运动供能',creatine:'肌酸补充',food:'营养支持',rest:'睡眠与恢复'};
export async function loadKnowledge(){
 const base=new URL('./assets/fitness-knowledge/data/',import.meta.url),names=['categories','glossary','concept_relations','overview_graph_v2','learning_paths','sources','overview_term_map','aliases','relation_types'];
 const values=await Promise.all(names.map(async name=>{const response=await fetch(new URL(name+'.json',base));if(!response.ok)throw Error('资料暂时无法读取：'+name);return response.json();}));
 const raw=Object.fromEntries(names.map((name,i)=>[name,values[i]]));
 const terms=raw.glossary.terms,categories=raw.categories.categories,termMap=new Map(terms.map(t=>[t.id,t])),sourceMap=new Map(raw.sources.sources.map(s=>[s.id,s]));
 const overviewNodes=raw.overview_graph_v2.nodes.map(n=>({...n,label:n.label,displayLabel:OVERVIEW_LABELS[n.id],x:LAYOUT[n.id][0],y:LAYOUT[n.id][1],z:1-n.layer/5,termIds:raw.overview_term_map[n.id]}));
 const overviewEdges=raw.overview_graph_v2.edges.map((e,i)=>({...e,id:'overview-'+i,direction:'directed'}));
 const termEdges=raw.concept_relations.relations.map((e,i)=>{const type=raw.relation_types[e.relation];if(!type)throw Error('未定义关系语义：'+e.relation);return{...e,id:'term-'+i,kind:type[0],label:type[1]};});
 return {terms,categories,termMap,sourceMap,overviewNodes,overviewEdges,termEdges,paths:raw.learning_paths.paths,sources:raw.sources.sources,nodeTerms:raw.overview_term_map,aliases:raw.aliases,raw};
}
export function findTerms(data,query='',category='all',sort='name'){
 const q=norm(query),rank=t=>{const exact=[t.id,t.slug,t.zh,t.en,...(data.aliases[t.id]||[])].some(s=>norm(s)===q);return exact?0:1;};
 return data.terms.filter(t=>(category==='all'||t.category===category)&&norm([t.id,t.slug,t.zh,t.en,t.definition,...(data.aliases[t.id]||[])].join(' ')).includes(q)).sort((a,b)=>(q?rank(a)-rank(b):0)||(sort==='en'?a.en.localeCompare(b.en):a.zh.localeCompare(b.zh,'zh-CN')));
}
export function withDegrees(nodes,edges){const map=new Map(nodes.map(n=>[n.id,{...n,degree:0,crossDomainDegree:0}]));for(const e of edges){const a=map.get(e.source),b=map.get(e.target);if(!a||!b)continue;a.degree++;b.degree++;if(a.category!==b.category){a.crossDomainDegree++;b.crossDomainDegree++;}}return [...map.values()];}
export function graphFor(data,{scope='overview',focus='mechanical-tension',depth=1,kinds=Object.keys(KINDS),category='all'}={}){
 let nodes,edges;
 if(scope==='overview'){nodes=data.overviewNodes;edges=data.overviewEdges;}
 else{
  const ids=new Set([focus]);for(let step=0;step<depth;step++){const next=new Set(ids);for(const e of data.termEdges)if(ids.has(e.source)||ids.has(e.target)){next.add(e.source);next.add(e.target);}for(const id of next)ids.add(id);}
  const terms=[...ids].map(id=>data.termMap.get(id)).filter(Boolean);nodes=terms.map((t,i)=>({...t,label:t.zh,x:i===0?.5:.5+.37*Math.cos((i-1)*2*Math.PI/Math.max(1,terms.length-1)),y:i===0?.5:.5+.37*Math.sin((i-1)*2*Math.PI/Math.max(1,terms.length-1)),z:.5+.3*Math.sin(i*1.8),termIds:[t.id]}));edges=data.termEdges.filter(e=>ids.has(e.source)&&ids.has(e.target));
 }
 nodes=nodes.filter(n=>category==='all'||n.category===category);const ids=new Set(nodes.map(n=>n.id));edges=edges.filter(e=>kinds.includes(e.kind)&&ids.has(e.source)&&ids.has(e.target));return{nodes:withDegrees(nodes,edges),edges};
}
