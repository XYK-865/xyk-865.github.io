const resumes={
  zh:{src:'assets/spike-hsu-resume-zh.pdf',label:'下载中文 PDF',title:'在线简历。',description:'在线阅读中文或英文版本，按需下载 PDF。'},
  en:{src:'assets/spike-hsu-resume-en.pdf',label:'Download English PDF',title:'The digital resume.',description:'Read the English or Chinese version here, and download the PDF if you need a file.'}
};
function showResume(language,updateUrl=false){
  const selected=resumes[language];
  document.querySelectorAll('[data-resume-download]').forEach(link=>{link.href=selected.src;link.firstChild.textContent=selected.label+' '});
  document.querySelector('#resume-page-title').textContent=selected.title;
  document.querySelector('#resume-page-description').textContent=selected.description;
  document.querySelectorAll('[data-resume-content]').forEach(content=>{content.hidden=content.dataset.resumeContent!==language});
  document.querySelectorAll('[data-resume-quote]').forEach(quote=>{quote.hidden=quote.dataset.resumeQuote!==language});
  document.querySelectorAll('[data-resume]').forEach(button=>{const active=button.dataset.resume===language;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active))});
  if(updateUrl){const url=new URL(location.href);url.searchParams.set('lang',language);history.replaceState(null,'',url)}
}
document.querySelectorAll('[data-resume]').forEach(button=>button.addEventListener('click',()=>showResume(button.dataset.resume,true)));
showResume(new URLSearchParams(location.search).get('lang')==='en'?'en':'zh');
