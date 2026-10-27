(() => {
  'use strict';
  if (window.SpikeCatLoader) return;
  const source = new URL(document.currentScript.src);
  const version = source.searchParams.get('v');
  const asset = name => { const url = new URL(name,source); if (version) url.searchParams.set('v',version); return url.href; };
  const pointer = matchMedia('(hover: hover) and (pointer: fine)');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let state = 'idle', pending = 0;
  const canLoad = () => pointer.matches && !motion.matches && !document.hidden;
  function continuing() {
    try { return sessionStorage.getItem('spike-cat-state-v1') !== null; } catch { return false; }
  }
  function cancel() {
    if (!pending) return;
    if ('cancelIdleCallback' in window) cancelIdleCallback(pending);
    else clearTimeout(pending);
    pending = 0;
  }
  function load() {
    pending = 0;
    if (!canLoad() || document.body.classList.contains('video-intro-open') || window.SpikeCat || state !== 'idle') return;
    state = 'loading';
    const css = document.createElement('link');
    css.id = 'spike-cat-style'; css.rel = 'stylesheet'; css.href = asset('cat.css');
    css.onload = () => {
      const script = document.createElement('script');
      script.id = 'spike-cat-script'; script.src = asset('cat.js');
      script.onload = () => { state = 'ready'; };
      script.onerror = () => { state = 'unavailable'; };
      document.head.append(script);
    };
    css.onerror = () => { state = 'unavailable'; };
    document.head.append(css);
  }
  function schedule() {
    cancel();
    if (!canLoad() || !document.body || document.body.classList.contains('video-intro-open') || window.SpikeCat || state !== 'idle') return;
    if (continuing()) { load(); return; }
    if ('requestIdleCallback' in window) pending = requestIdleCallback(load, {timeout:1200});
    else pending = setTimeout(load, 300);
  }
  function ready() {
    new MutationObserver(schedule).observe(document.body,{attributes:true,attributeFilter:['class']});
    if (continuing()) schedule();
    else requestAnimationFrame(() => requestAnimationFrame(schedule));
  }
  window.SpikeCatLoader = Object.freeze({get state(){return state;},get eligible(){return pointer.matches&&!motion.matches;}});
  pointer.addEventListener('change',schedule); motion.addEventListener('change',schedule);
  document.addEventListener('visibilitychange',schedule);
  addEventListener('pagehide',cancel); addEventListener('pageshow',schedule);
  if (!document.body) document.addEventListener('DOMContentLoaded',ready,{once:true});
  else ready();
})();
