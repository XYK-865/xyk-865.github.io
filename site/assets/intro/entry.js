(() => {
  'use strict';
  if (window.SpikeIntroGate) return;
  const root = document.documentElement;
  const script = new URL(document.currentScript.src);
  const version = script.searchParams.get('v') || 'cat-smooth-parity-20261027';
  root.dataset.siteRelease = version;
  let timeout;
  const release = () => { clearTimeout(timeout); root.classList.remove('site-intro-pending'); };
  window.SpikeIntroGate = Object.freeze({release});
  let seen = false;
  try {
    if (sessionStorage.getItem('spike-site-intro-release') !== version) {
      sessionStorage.removeItem('spike-site-intro-v1');
      sessionStorage.setItem('spike-site-intro-release',version);
    }
    seen = sessionStorage.getItem('spike-site-intro-v1') === '1';
  } catch {}
  if (seen || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const style = document.createElement('style');
  style.textContent = 'html.site-intro-pending{background:#090709}html.site-intro-pending body{visibility:hidden}';
  document.head.append(style);
  root.classList.add('site-intro-pending');
  // Prepare the original animation before the page can flash underneath it.
  for (const name of ['site-intro.css','emblem.js','intro-scene.js','site-intro.js']) {
    const link = document.createElement('link');
    const url = new URL(name,script); url.searchParams.set('v',version);
    link.rel = 'preload'; link.as = name.endsWith('.css') ? 'style' : 'script';
    link.href = url.href; link.fetchPriority = 'high'; document.head.append(link);
  }
  const loader = document.createElement('script');
  const loaderURL = new URL('site-intro-loader.js',script); loaderURL.searchParams.set('v',version);
  loader.src = loaderURL.href; loader.dataset.siteIntroLoader = '';
  loader.onerror = release; document.head.append(loader);
  timeout = setTimeout(release,6500);
})();
