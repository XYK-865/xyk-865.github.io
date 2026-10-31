import {supplements,sources,evidenceGroups,activityLevels,energySources} from './supplements-data.js';

export function estimateEnergy({sex,weight,height,age,activity}) {
  const values=[weight,height,age,activity].map(Number);
  if(!values.every(Number.isFinite))throw new RangeError('请填写完整的数字。');
  [weight,height,age,activity]=values;
  if(!['male','female'].includes(sex))throw new RangeError('请选择公式的性别参数。');
  if(!Number.isInteger(age)||age<19||age>78)throw new RangeError('年龄需为 19–78 岁的整数。');
  if(weight<35||weight>250||height<120||height>230)throw new RangeError('请核对体重（35–250 kg）与身高（120–230 cm）。');
  if(!activityLevels.some(level=>level.value===activity))throw new RangeError('请选择页面提供的活动系数。');
  const rmr=10*weight+6.25*height-5*age+(sex==='male'?5:-161);
  return {rmr,tdee:rmr*activity,activity};
}

const escape=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const link=source=>'<a href="'+escape(source.url)+'" target="_blank" rel="noopener noreferrer">'+escape(source.title)+' ↗</a>';

function init() {
  const form=document.querySelector('#energy-form'),activity=form?.querySelector('[name=activity]');
  const cards=document.querySelector('#supplement-cards'),search=document.querySelector('#supplement-search'),filter=document.querySelector('#supplement-evidence');
  if(form){
    for(const level of activityLevels){const option=document.createElement('option');option.value=level.value;option.textContent=level.label;activity.append(option);}
    document.querySelector('#energy-sources').innerHTML=energySources.map(source=>'<li>'+link(source)+'</li>').join('');
    activity.addEventListener('change',()=>{document.querySelector('#energy-activity-description').textContent=activityLevels.find(level=>level.value===Number(activity.value))?.detail||'';});
    form.addEventListener('submit',event=>{
      event.preventDefault();
      if(!form.reportValidity())return;
      try{
        const fields=Object.fromEntries(new FormData(form)),result=estimateEnergy(fields);
        const number=value=>(Math.round(value/10)*10).toLocaleString('zh-CN');
        document.querySelector('#energy-rmr').textContent='约 '+number(result.rmr);
        document.querySelector('#energy-tdee').textContent='约 '+number(result.tdee);
        document.querySelector('#energy-result-detail').textContent='Mifflin–St Jeor 静息消耗估算 × '+result.activity+' 活动系数。TDEE 是近似值，未直接测量你的活动与代谢。';
        document.querySelector('#energy-status').textContent='已按当前输入估算。可修改数据后重新计算。';
      }catch(error){document.querySelector('#energy-status').textContent=error.message;}
    });
    form.addEventListener('reset',()=>{
      document.querySelector('#energy-rmr').textContent='—';document.querySelector('#energy-tdee').textContent='—';
      document.querySelector('#energy-result-detail').textContent='完成左侧输入后显示结果。数字按 10 千卡取整，避免把估算看成精确测量。';
      document.querySelector('#energy-activity-description').textContent='把工作、步行、家务与训练一起考虑，不只看每周去健身房几次。';
      document.querySelector('#energy-status').textContent='已清空输入与计算结果。';
    });
  }
  if(!cards||!search||!filter)return;
  document.querySelector('#supplement-index').innerHTML=supplements.map(item=>'<a href="#'+escape(item.id)+'">'+escape(item.name)+'</a>').join('');
  for(const [value,group] of Object.entries(evidenceGroups)){const option=document.createElement('option');option.value=value;option.textContent=group.label;filter.append(option);}
  cards.innerHTML=supplements.map((item,index)=>'<article class="supplement-card" id="'+escape(item.id)+'" data-evidence="'+escape(item.evidence)+'">'+
    '<div class="supplement-card-top"><span>'+String(index+1).padStart(2,'0')+' / '+escape(item.category)+'</span><a href="#'+escape(item.id)+'" aria-label="定位到'+escape(item.name)+'">↗</a></div>'+
    '<h3>'+escape(item.name)+'</h3><p class="supplement-english">'+escape(item.english)+'</p><span class="supplement-evidence" data-level="'+escape(item.evidence)+'">'+escape(evidenceGroups[item.evidence].label)+'</span>'+
    '<dl><div><dt>作用与潜在收益</dt><dd>'+escape(item.action)+' '+escape(item.benefit)+'</dd></div><div><dt>适用情境</dt><dd>'+escape(item.context)+'</dd></div><div><dt>证据边界</dt><dd>'+escape(item.boundary)+'</dd></div></dl>'+
    '<div class="supplement-risk"><strong>风险与相互作用关注</strong><p>'+escape(item.risk)+'</p></div><details><summary>研究与资料来源（'+item.references.length+'）</summary><ol class="supplement-sources">'+
    item.references.map(id=>'<li>'+link(sources[id])+'<small>'+escape(sources[id].kind)+'</small></li>').join('')+'</ol></details></article>').join('');
  const applyFilters=()=>{
    const term=search.value.trim().toLocaleLowerCase('zh-CN');let visible=0;
    for(const item of supplements){const match=(filter.value==='all'||filter.value===item.evidence)&&Object.values(item).join(' ').toLocaleLowerCase('zh-CN').includes(term);document.getElementById(item.id).hidden=!match;if(match)visible++;}
    document.querySelector('#supplement-count').textContent='显示 '+visible+' / '+supplements.length+' 类资料'+(visible?'':'，可清空关键词或切换分类。');
  };
  const revealAnchor=()=>{
    let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}
    if(!supplements.some(item=>item.id===id))return;
    search.value='';filter.value='all';applyFilters();
    requestAnimationFrame(()=>document.getElementById(id).scrollIntoView({block:'start'}));
  };
  search.addEventListener('input',applyFilters);filter.addEventListener('change',applyFilters);window.addEventListener('hashchange',revealAnchor);
  applyFilters();revealAnchor();
}

if(typeof document!=='undefined')init();
