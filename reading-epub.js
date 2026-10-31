const parser=new DOMParser();
const resolvePath=(base,href)=>decodeURIComponent(new URL(href,'https://epub.invalid/'+base).pathname.slice(1));
const readXML=async(zip,path)=>{const entry=zip.file(path);if(!entry)throw Error('EPUB 缺少 '+path);return parser.parseFromString(await entry.async('string'),'application/xml');};
const first=(doc,name)=>doc.getElementsByTagNameNS('*',name)[0];
export async function openEPUB(bytes){
 await import('./assets/vendor/jszip/jszip.min.js');const zip=await window.JSZip.loadAsync(bytes);
 const container=await readXML(zip,'META-INF/container.xml'),opfPath=first(container,'rootfile')?.getAttribute('full-path');
 if(!opfPath)throw Error('未找到 EPUB 的内容包。');
 const opf=await readXML(zip,opfPath),manifest=new Map(),urls=new Map();
 for(const node of opf.getElementsByTagNameNS('*','item'))manifest.set(node.getAttribute('id'),{path:resolvePath(opfPath,node.getAttribute('href')),type:node.getAttribute('media-type'),properties:node.getAttribute('properties')||''});
 const resourceURL=async path=>{
  if(urls.has(path))return urls.get(path);const file=zip.file(path);if(!file)return null;
  const mime=[...manifest.values()].find(item=>item.path===path)?.type||'application/octet-stream';
  const url=URL.createObjectURL(new Blob([await file.async('arraybuffer')],{type:mime}));urls.set(path,url);return url;
 };
 const spine=[...opf.getElementsByTagNameNS('*','itemref')].filter(n=>n.getAttribute('linear')!=='no').map(n=>manifest.get(n.getAttribute('idref'))).filter(Boolean);
 const prefixes=new Map(spine.map((item,index)=>[item.path,'epub-chapter-'+index]));
 const targetId=(base,href)=>{const url=new URL(href,'https://epub.invalid/'+base),prefix=prefixes.get(decodeURIComponent(url.pathname.slice(1)));return prefix?(url.hash?prefix+'--'+decodeURIComponent(url.hash.slice(1)):prefix):null;};
 const fragment=document.createDocumentFragment();
 for(const item of spine){
  const xml=await readXML(zip,item.path),body=first(xml,'body');if(!body)continue;
  const section=document.createElement('section');section.id=prefixes.get(item.path);section.className='epub-chapter';
  for(const child of [...body.childNodes])section.append(document.importNode(child,true));
  section.querySelectorAll('script,style,link,iframe,object,embed,form,input,button,audio,video').forEach(el=>el.remove());
  for(const el of section.querySelectorAll('*')){
   for(const a of [...el.attributes])if(a.name.startsWith('on')||['style','srcdoc','srcset'].includes(a.name))el.removeAttribute(a.name);
   if(el.id)el.id=section.id+'--'+el.id;
   if(el.localName==='img'||el.localName==='image'){
    const href=el.getAttribute('src')||el.getAttribute('href')||el.getAttribute('xlink:href');
    if(!href||/^(https?:|data:|javascript:)/i.test(href)){el.remove();continue;}
    const url=await resourceURL(resolvePath(item.path,href));if(!url){el.remove();continue;}
    if(el.localName==='image'){
     const img=document.createElement('img');img.src=url;img.alt='书中插图';const svg=el.closest('svg');(svg||el).replaceWith(img);
    }else{el.setAttribute('src',url);el.removeAttribute('width');el.removeAttribute('height');el.setAttribute('loading','eager');}
   }
   if(el.localName==='a'){
    const href=el.getAttribute('href')||'',target=targetId(item.path,href);
    if(target)el.setAttribute('href','#'+target);
    else if(/^https?:\/\//i.test(href)){el.setAttribute('target','_blank');el.setAttribute('rel','noopener noreferrer');}
    else el.removeAttribute('href');
   }
  }
  fragment.append(section);
 }
 const outline=[];
 const nav=[...manifest.values()].find(item=>item.properties.split(/\s+/).includes('nav'));
 if(nav){
  const xml=await readXML(zip,nav.path),toc=[...xml.getElementsByTagNameNS('*','nav')].find(n=>(n.getAttribute('epub:type')||'').includes('toc'))||first(xml,'nav');
  for(const a of toc?.getElementsByTagNameNS('*','a')||[]){const id=targetId(nav.path,a.getAttribute('href'));if(id)outline.push({title:a.textContent.trim(),id,depth:0});}
 }else{
  const ncx=manifest.get(first(opf,'spine')?.getAttribute('toc'))||[...manifest.values()].find(item=>item.type==='application/x-dtbncx+xml');
  if(ncx){const xml=await readXML(zip,ncx.path);for(const point of xml.getElementsByTagNameNS('*','navPoint')){
   const href=first(point,'content')?.getAttribute('src'),id=href&&targetId(ncx.path,href);let depth=0,parent=point.parentElement;while(parent?.localName==='navPoint'){depth++;parent=parent.parentElement;}
   if(id)outline.push({title:first(point,'navLabel')?.textContent.trim()||'章节',id,depth});
  }}
 }
 if(!outline.length)for(const section of fragment.children)outline.push({title:section.querySelector('h1,h2,h3')?.textContent||'第 '+(outline.length+1)+' 节',id:section.id,depth:0});
 const coverId=[...opf.getElementsByTagNameNS('*','meta')].find(n=>n.getAttribute('name')==='cover')?.getAttribute('content');
 const cover=manifest.get(coverId)||[...manifest.values()].find(item=>item.properties.includes('cover-image'));
 return {fragment,outline,title:first(opf,'title')?.textContent,cover:cover?await resourceURL(cover.path):null,release(){for(const url of urls.values())URL.revokeObjectURL(url);}};
}
