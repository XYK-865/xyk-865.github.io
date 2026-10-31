import {loadCatalogue} from './reading-catalogue.js';
const papers=(await loadCatalogue()).filter(item=>item.type==='论文'&&item.kind==='pdf'&&item.source?.startsWith('/local-library/'));
const list=document.querySelector('.resource-section .resource-list');
for(const item of papers){
 const card=document.createElement('a');card.className='resource-card';card.href='fitness-reader.html?id='+encodeURIComponent(item.id);
 const mark=document.createElement('span');mark.className='resource-card-mark';mark.textContent='PDF';mark.setAttribute('aria-hidden','true');
 const copy=document.createElement('div'),meta=document.createElement('small'),title=document.createElement('h3'),summary=document.createElement('p'),action=document.createElement('strong');
 meta.textContent=item.author+' · 本地原文 · '+item.pages+' 页';title.textContent=item.title;
 summary.textContent='讨论抗阻训练负荷与肌肉力量、肌肥大、局部肌耐力之间的关系。';action.textContent='打开原文阅读器 ↗';
 copy.append(meta,title,summary,action);card.append(mark,copy);list?.prepend(card);
}
if(papers.length){const count=document.querySelector('.fitness-article-meta span');count.textContent=(3+papers.length)+' 篇研究论文';}
