const dbPromise=new Promise((resolve,reject)=>{
 const request=indexedDB.open('spike-reading-library',1);
 request.onupgradeneeded=()=>{for(const name of ['items','files','state'])if(!request.result.objectStoreNames.contains(name))request.result.createObjectStore(name,{keyPath:'id'});};
 request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);
});
async function storeAction(name,mode,action){
 const db=await dbPromise;
 return new Promise((resolve,reject)=>{const tx=db.transaction(name,mode),request=action(tx.objectStore(name));let result;request.onsuccess=()=>{result=request.result};tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('保存已中止'));});
}
export const getItem=id=>storeAction('items','readonly',s=>s.get(id));
export const getFile=id=>storeAction('files','readonly',s=>s.get(id));
export const getState=async id=>(await storeAction('state','readonly',s=>s.get(id)))||{id,progress:0,annotations:[]};
export const listItems=()=>storeAction('items','readonly',s=>s.getAll());
export const listStates=()=>storeAction('state','readonly',s=>s.getAll());
export const saveState=state=>storeAction('state','readwrite',s=>s.put(state));
export async function importItem(item,file){
 const db=await dbPromise;
 return new Promise((resolve,reject)=>{const tx=db.transaction(['items','files'],'readwrite');tx.objectStore('items').put(item);tx.objectStore('files').put({id:item.id,...file});tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('导入失败'));});
}

