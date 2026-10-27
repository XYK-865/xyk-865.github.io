(() => {
  'use strict';
  if (window.SpikeSiteIntroLoading) return;
  window.SpikeSiteIntroLoading = true;
  const source = new URL(document.currentScript.src);
  const version = source.searchParams.get('v');
  const asset = name => { const url = new URL(name,source); if (version) url.searchParams.set('v',version); return url.href; };
  const style = document.createElement('link');
  style.rel = 'stylesheet'; style.href = asset('site-intro.css');
  const styled = new Promise((resolve, reject) => { style.onload = resolve; style.onerror = reject; });
  document.head.append(style);
  function script(name) {
    return new Promise((resolve, reject) => {
      const element = document.createElement('script');
      element.src = asset(name);
      element.onload = resolve; element.onerror = reject;
      document.head.append(element);
    });
  }
  const content = new Promise(resolve => {
    const complete = () => {
      if (!document.querySelector('#main') || !document.querySelector('#site-footer')) return;
      observer.disconnect(); resolve();
    };
    const observer = new MutationObserver(complete);
    observer.observe(document.documentElement,{childList:true,subtree:true}); complete();
  });
  Promise.all([styled, content, script('emblem.js'), script('intro-scene.js')])
    .then(() => script('site-intro.js'))
    .catch(() => { window.SpikeIntroGate?.release(); });
})();
