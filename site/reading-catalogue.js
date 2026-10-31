export const catalogue=[
{id:'pyramids',title:'The Muscle and Strength Pyramids',type:'书籍',label:'书籍资料 · 未导入正文',source:'fitness-book-muscle-strength-pyramids.html',selector:'.resource-detail',tone:'sand',subtitle:'Training & Nutrition',author:'Eric Helms 等'},
{id:'philosophy-v2',title:'增肌区块周期化训练理念',type:'文章',label:'理念总纲 · V2',source:'fitness-philosophy.html',selector:'.practice-article',tone:'teal',subtitle:'力量侧重 ⇄ 容量侧重',author:'个人训练整理'},
{id:'methods-v3',title:'增肌训练方法专题',type:'文章',label:'方法专题 · V3',source:'fitness-methods.html',selector:'.practice-article',tone:'plum',subtitle:'问题、方法与训练日',author:'个人训练整理'},
{id:'drop-2023',title:'递减组与肌肉增长',type:'论文',label:'研究摘要 · 2023',source:'fitness-paper-drop-sets-2023.html',selector:'.resource-detail',tone:'blue',subtitle:'Drop Sets & Hypertrophy',author:'Sødal 等'},
{id:'drop-2026',title:'递减组的急性反应与长期适应',type:'论文',label:'研究摘要 · 2026',source:'fitness-paper-drop-sets-2026.html',selector:'.resource-detail',tone:'rust',subtitle:'Acute & Chronic Effects',author:'Havers 等'},
{id:'variation-2022',title:'动作变化与肌肥大、力量',type:'论文',label:'研究摘要 · 2022',source:'fitness-paper-exercise-variation-2022.html',selector:'.resource-detail',tone:'sage',subtitle:'Exercise Variation',author:'Kassiano 等'},
{id:'philosophy-v1',title:'增肌区块周期化训练理念',type:'文章',label:'基础版本 · V1',source:'fitness-philosophy-v1.html',selector:'.practice-article',tone:'gray',subtitle:'训练框架的最初版本',author:'版本档案'}
];
export const fileCatalogue=[
 {
  "id": "eating-science",
  "title": "吃的科学",
  "subtitle": "饮食、健康与个人记录",
  "type": "书籍",
  "kind": "epub",
  "author": "巴斯·卡斯特（Bas Kast）",
  "label": "EPUB · 选择本机文件阅读",
  "cover": "assets/books/covers/eating-science.webp",
  "requiresImport": true
 },
 {
  "id": "loading-recommendations",
  "title": "Loading Recommendations for Muscle Strength, Hypertrophy, and Local Endurance",
  "type": "论文",
  "kind": "pdf",
  "author": "Brad J. Schoenfeld 等",
  "label": "PDF · 选择本机文件阅读",
  "cover": "assets/books/covers/loading-recommendations.webp",
  "requiresImport": true
 },
 {
  "id": "leangains",
  "title": "The Leangains Method",
  "subtitle": "The Art of Getting Ripped",
  "type": "书籍",
  "kind": "pdf",
  "author": "Martin Berkhan",
  "label": "PDF · 选择本机文件阅读",
  "cover": "assets/books/covers/leangains.webp",
  "requiresImport": true
 },
 {
  "id": "functional-training",
  "title": "功能性训练：提升运动表现的动作练习和方案设计",
  "type": "书籍",
  "kind": "pdf",
  "author": "胡安·卡洛斯·桑塔纳",
  "label": "PDF · 选择本机文件阅读",
  "cover": "assets/books/covers/functional-training.webp",
  "requiresImport": true
 },
 {
  "id": "core-stability",
  "title": "肌肉训练完全图解：核心稳定性训练",
  "type": "书籍",
  "kind": "pdf",
  "author": "霍利斯·兰斯·利伯曼",
  "label": "PDF · 选择本机文件阅读",
  "cover": "assets/books/covers/core-stability.webp",
  "requiresImport": true
 },
 {
  "id": "nsca-strength",
  "title": "美国国家体能协会力量训练指南（第2版）",
  "type": "书籍",
  "kind": "pdf",
  "author": "NSCA · Lee E. Brown 编著",
  "label": "PDF · 选择本机文件阅读",
  "cover": "assets/books/covers/nsca-strength.webp",
  "requiresImport": true
 },
 {
  "id": "bodybuilding-anatomy",
  "title": "健美健身运动系统训练（全彩图解第2版）",
  "type": "书籍",
  "kind": "epub",
  "author": "尼克·伊万斯",
  "label": "EPUB · 选择本机文件阅读",
  "cover": "assets/books/covers/bodybuilding-anatomy.webp",
  "requiresImport": true
 }
];
export async function loadCatalogue(){
 if(['127.0.0.1','localhost','[::1]'].includes(location.hostname)){
  try{const response=await fetch('/local-library/catalogue.json');if(response.ok)return [...await response.json(),...catalogue];}catch{}
 }
 return [...fileCatalogue,...catalogue];
}

