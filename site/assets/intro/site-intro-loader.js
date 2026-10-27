(() => {
  'use strict';
  if (window.SpikeSiteIntroLoading) return;
  window.SpikeSiteIntroLoading = true;
  const root = new URL('./', document.currentScript.src);
  const style = document.createElement('link');
  style.rel = 'stylesheet'; style.href = new URL('site-intro.css', root).href;
  const styled = new Promise((resolve, reject) => { style.onload = resolve; style.onerror = reject; });
  document.head.append(style);
  function script(name) {
    return new Promise((resolve, reject) => {
      const element = document.createElement('script');
      element.src = new URL(name, root).href;
      element.onload = resolve; element.onerror = reject;
      document.head.append(element);
    });
  }
  Promise.all([styled, script('emblem.js'), script('intro-scene.js')])
    .then(() => script('site-intro.js'))
    .catch(() => { /* Page content remains usable when optional intro assets are unavailable. */ });
})();
