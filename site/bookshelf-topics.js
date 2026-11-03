// A resource may belong to several topics; local imports can add their own topics.
export const catalogueTopics={
 'pyramids':['training','nutrition'],
 'philosophy-v2':['training'],
 'methods-v3':['training'],
 'drop-2023':['training'],
 'drop-2026':['training'],
 'variation-2022':['training'],
 'philosophy-v1':['training'],
 'eating-science':['health','nutrition'],
 'loading-recommendations':['training'],
 'leangains':['training','nutrition'],
 'functional-training':['training'],
 'core-stability':['training'],
 'nsca-strength':['training'],
 'bodybuilding-anatomy':['training']
};
export function getItemTopics(item){
 return [...new Set([...(catalogueTopics[item.id]||[]),...(Array.isArray(item.topics)?item.topics:[])])].filter(topic=>['training','health','nutrition'].includes(topic));
}
export function normalizeShelfCategory(category){
 return ['general','training','health','nutrition','dating'].includes(category)?category:'general';
}
