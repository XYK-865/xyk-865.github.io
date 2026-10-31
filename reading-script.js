export function createScriptView(){
 const convert=window.OpenCC.Converter({from:'tw',to:'cn'});
 let simplified=localStorage.getItem('spike-reading-simplified')==='true',root=null,nodes=[];
 const auxiliary=new Map();
 const display=text=>simplified?convert(String(text)):String(text);
 const allText=()=>nodes.map(entry=>entry.original).join('');
 function apply(){for(const entry of nodes)entry.node.nodeValue=display(entry.original);for(const [el,text]of auxiliary)if(el.isConnected)el.textContent=display(text);}
 function setRoot(element){root=element;nodes=[];const walker=document.createTreeWalker(element,NodeFilter.SHOW_TEXT);let node;while(node=walker.nextNode())nodes.push({node,original:node.nodeValue});apply();}
 function setAux(elements){auxiliary.clear();for(const el of elements)if(el)auxiliary.set(el,el.textContent);apply();}
 function setSimplified(value){simplified=!!value;localStorage.setItem('spike-reading-simplified',String(simplified));apply();}
 function forward(offset){let source=0,target=0;for(const entry of nodes){if(offset<=source+entry.original.length)return target+display(entry.original.slice(0,Math.max(0,offset-source))).length;source+=entry.original.length;target+=entry.node.nodeValue.length;}return target;}
 function backward(offset){let source=0,target=0;for(const entry of nodes){const length=entry.node.nodeValue.length;if(offset<=target+length){const wanted=Math.max(0,offset-target);if(!simplified)return source+wanted;let lo=0,hi=entry.original.length;while(lo<hi){const mid=(lo+hi)>>1;if(display(entry.original.slice(0,mid)).length<wanted)lo=mid+1;else hi=mid;}return source+lo;}source+=entry.original.length;target+=length;}return source;}
 function capture(range){const prefix=document.createRange();prefix.selectNodeContents(root);prefix.setEnd(range.startContainer,range.startOffset);const start=backward(prefix.toString().length),end=backward(prefix.toString().length+range.toString().length);return{start,end,quote:allText().slice(start,end)};}
 function locate(note,rangeAt){let start=note.start,end=note.end;const text=allText();if(text.slice(start,end)!==note.quote){start=text.indexOf(note.quote);end=start+note.quote.length;}return start<0?null:rangeAt(root,forward(start),forward(end));}
 return {setRoot,setAux,setSimplified,display,convert,capture,locate,isSimplified:()=>simplified};
}
