const resumes={zh:{src:'assets/spike-hsu-resume-zh.pdf',title:'中文简历 PDF',label:'在新窗口打开中文 PDF ↗'},en:{src:'assets/spike-hsu-resume-en.pdf',title:'English CV PDF',label:'Open English PDF in a new tab ↗'}};
const frame=document.querySelector('#resume-frame');
const openLink=document.querySelector('#resume-open');
document.querySelectorAll('[data-resume]').forEach(button=>button.addEventListener('click',()=>{
  const selected=resumes[button.dataset.resume];
  frame.src=selected.src;
  frame.title=selected.title;
  openLink.href=selected.src;
  openLink.textContent=selected.label;
  document.querySelectorAll('[data-resume]').forEach(item=>{const active=item===button;item.classList.toggle('active',active);item.setAttribute('aria-pressed',String(active))});
}));
