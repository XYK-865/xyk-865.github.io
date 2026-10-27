(() => {
  'use strict';
  if (window.SpikeSiteIntro) return;
  const source = new URL(document.currentScript.src);
  const version = source.searchParams.get('v');
  const asset = name => { const url = new URL(name,source); if (version) url.searchParams.set('v',version); return url.href; };
  const rawEmblem = window.SpikeSiteIntroEmblem;
  if (typeof rawEmblem !== 'string') { window.SpikeIntroGate?.release(); return; }
  const parsedEmblem = new DOMParser().parseFromString(rawEmblem, 'image/svg+xml').documentElement;
  if (parsedEmblem.localName !== 'svg') { window.SpikeIntroGate?.release(); return; }
  const entry = document.querySelector('#main') || document.body;
  if (!entry.hasAttribute('tabindex')) entry.setAttribute('tabindex', '-1');
  const footer = document.querySelector('#site-footer') || document.body;
  const replay = document.createElement('button');
  replay.type = 'button';
  replay.className = 'site-intro-replay';
  replay.setAttribute('data-site-intro-replay', '');
  replay.title = '重播个人开屏（可开启音效）';
  replay.textContent = '重播开屏';
  footer.append(replay);
  document.body.classList.add('site-intro-enabled');
  const sessionKey = 'spike-site-intro-v1';
  const duration = 6.1;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const dialog = document.createElement('dialog');
  dialog.className = 'personal-intro-dialog';
  dialog.setAttribute('aria-label', 'Spike Hsu 个人开屏');
  dialog.innerHTML = `
    <div class="personal-intro-visual">
      <canvas class="personal-intro-canvas" aria-hidden="true"></canvas>
      <div class="personal-intro-mark" aria-hidden="true"></div>
      <h2 class="personal-intro-name">Spike Hsu</h2>
      <p class="personal-intro-signature" aria-hidden="true">SPIKE HSU / PERSONAL SPACE</p>
    </div>
    <button class="personal-intro-skip" type="button" autofocus>跳过开屏 <span aria-hidden="true">Esc</span></button>
    <button class="personal-intro-sound" type="button" aria-pressed="false">开启音效</button>
    <p class="personal-intro-sound-hint" hidden>点击开启音效，也可在页脚选择“重播开屏”。</p>
    <audio class="personal-intro-audio" preload="none" hidden></audio>`;
  const emblem = document.importNode(parsedEmblem, true);
  const emblemUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(emblem));
  dialog.querySelector('.personal-intro-mark').append(emblem);
  document.body.append(dialog);
  const canvas = dialog.querySelector('canvas');
  const visual = dialog.querySelector('.personal-intro-visual');
  const mark = dialog.querySelector('.personal-intro-mark');
  const name = dialog.querySelector('.personal-intro-name');
  const signature = dialog.querySelector('.personal-intro-signature');
  const skip = dialog.querySelector('.personal-intro-skip');
  const audio = dialog.querySelector('audio');
  audio.src = asset('intro-reference.wav');
  const soundButton = dialog.querySelector('.personal-intro-sound');
  const soundHint = dialog.querySelector('.personal-intro-sound-hint');
  const notice = document.createElement('p');
  notice.className = 'personal-intro-notice';
  notice.setAttribute('role', 'status');
  notice.hidden = true;
  footer.append(notice);
  let scene;
  let request = 0;
  let closeTimer;
  let watchdog;
  let run = 0;
  let state = 'idle';
  let elapsed = 0;
  let frameCount = 0;
  let returnFocus;
  let seen = false;
  let soundWanted = true, soundBlocked = false, soundRun = 0, soundFade;
  let audioRequested = false;
  try { seen = sessionStorage.getItem(sessionKey) === '1'; } catch { /* Storage is optional. */ }
  const ease = (from, to, time) => {
    const t = Math.max(0, Math.min(1, (time - from) / (to - from)));
    return t * t * (3 - 2 * t);
  };
  function showNotice(text) {
    notice.textContent = text;
    notice.hidden = false;
  }
  function stopSound(immediate = true) {
    ++soundRun;
    clearInterval(soundFade);
    soundButton.setAttribute('aria-pressed', 'false');
    soundButton.textContent = '开启音效';
    if (immediate || audio.paused) { audio.pause(); return; }
    const started = performance.now(), volume = audio.volume;
    soundFade = setInterval(() => {
      const fade = Math.min(1, (performance.now() - started) / 120);
      audio.volume = Math.max(0, volume * (1 - fade));
      if (fade >= 1) { clearInterval(soundFade); audio.pause(); }
    }, 16);
  }
  async function startSound(time) {
    if (!soundWanted || time >= duration - .2) return;
    clearInterval(soundFade);
    const token = ++soundRun;
    const rate = (Number.isFinite(audio.duration) ? audio.duration : 5.7735) / duration;
    audio.playbackRate = rate;
    audio.currentTime = Math.min(time * rate, 5.77);
    audio.volume = .85 * (1 - ease(5.3, duration, time));
    try {
      await audio.play();
      if (token !== soundRun || !dialog.open) return;
      soundBlocked = false;
      soundButton.textContent = '关闭音效';
      soundButton.setAttribute('aria-pressed', 'true');
      soundHint.hidden = true;
    } catch {
      if (token !== soundRun || !dialog.open) return;
      soundBlocked = true;
      soundButton.textContent = '开启音效';
      soundButton.setAttribute('aria-pressed', 'false');
      soundHint.hidden = false;
    }
  }
  function stop() {
    cancelAnimationFrame(request);
    clearTimeout(closeTimer);
    clearTimeout(watchdog);
    request = 0;
  }
  function release() {
    window.SpikeIntroGate?.release();
    ++run;
    stop();
    stopSound();
    scene?.destroy();
    scene = undefined;
    state = 'idle';
    document.body.classList.remove('video-intro-open', 'personal-intro-underlay');
    document.body.style.removeProperty('--personal-intro-scrollbar');
    const target = returnFocus?.isConnected ? returnFocus : entry;
    target.focus({preventScroll: true});
  }
  function close() {
    dialog.close();
    release();
  }
  function finish(immediate = false) {
    if (!dialog.open || state === 'closing') return;
    ++run;
    stop();
    stopSound(immediate || reducedMotion.matches);
    state = 'closing';
    document.body.classList.remove('personal-intro-underlay');
    dialog.classList.add('is-skipping');
    if (immediate || reducedMotion.matches) close();
    else closeTimer = setTimeout(close, 330);
  }
  function render(time) {
    elapsed = time;
    scene.render(time);
    const resolved = ease(2.96, 3.64, time);
    const named = ease(3.40, 4.24, time);
    const light = ease(4.78, 5.68, time);
    const reveal = ease(5.02, duration, time);
    mark.style.opacity = String(resolved * (1 - light));
    mark.style.transform = `translate(-50%,-50%) scale(${1 + (1 - resolved) * .075})`;
    name.style.opacity = String(named * (1 - light));
    name.style.transform = `translateY(${(1 - named) * 15}px)`;
    name.style.filter = `blur(${(1 - named) * 9}px)`;
    name.style.letterSpacing = `${.035 + (1 - named) * .055}em`;
    signature.style.opacity = String((1 - reveal) * .7);
    skip.style.opacity = String(1 - reveal);
    soundButton.style.opacity = String(1 - reveal);
    soundHint.style.opacity = String(1 - reveal);
    if (!audio.paused && soundWanted) audio.volume = .85 * (1 - ease(5.3, duration, time));
    visual.style.opacity = String(1 - reveal);
    if (time >= 4.95 && state !== 'revealing') {
      state = 'revealing';
      document.body.classList.remove('personal-intro-underlay');
    }
    ++frameCount;
  }
  function staticCard(message) {
    window.SpikeIntroGate?.release();
    skip.focus({preventScroll:true});
    stopSound();
    soundButton.hidden = true;
    soundHint.hidden = true;
    state = 'static';
    if (message) showNotice(message);
    canvas.hidden = true;
    mark.style.opacity = '1';
    mark.style.transform = 'translate(-50%,-50%)';
    name.style.opacity = '1';
    name.style.filter = 'none';
    name.style.transform = 'none';
    name.style.letterSpacing = '.035em';
    closeTimer = setTimeout(() => finish(), 1300);
  }
  async function play() {
    if (dialog.open) return false;
    seen = true;
    try { sessionStorage.setItem(sessionKey, '1'); } catch { /* Storage is optional. */ }
    if (typeof dialog.showModal !== 'function') {
      window.SpikeIntroGate?.release();
      showNotice('浏览器暂不支持开屏，当前页面可正常浏览。');
      return false;
    }
    stop();
    const currentRun = ++run;
    returnFocus = document.activeElement !== document.body ? document.activeElement : entry;
    elapsed = 0;
    state = 'loading';
    notice.hidden = true;
    stopSound();
    soundButton.hidden = false;
    soundHint.hidden = true;
    soundBlocked = false;
    audio.currentTime = 0;
    canvas.hidden = false;
    mark.style.opacity = name.style.opacity = '0';
    visual.style.opacity = signature.style.opacity = skip.style.opacity = '1';
    dialog.classList.remove('is-skipping');
    try { dialog.showModal(); } catch {
      window.SpikeIntroGate?.release();
      state = 'idle';
      showNotice('开屏暂时无法打开，当前页面可正常浏览。');
      return false;
    }
    document.body.style.setProperty('--personal-intro-scrollbar', `${Math.max(0, innerWidth - document.documentElement.clientWidth)}px`);
    document.body.classList.add('video-intro-open', 'personal-intro-underlay');
    skip.focus({preventScroll: true});
    if (reducedMotion.matches) {
      staticCard();
      return true;
    }
    watchdog = setTimeout(() => finish(true), 9500);
    try {
      scene = new window.PersonalIntroScene(canvas, {emblemUrl});
      if (!scene.context) throw new Error('Canvas unavailable');
      await scene.ready();
      if (currentRun !== run || !dialog.open) return false;
      if (!audioRequested) {
        audio.preload = 'auto';
        audio.load();
        audioRequested = true;
      }
      state = 'playing';
      const started = performance.now();
      let lastPaint = -100;
      const frame = now => {
        if (currentRun !== run || !dialog.open) return;
        const time = (now - started) / 1000;
        if (time >= duration) {
          try { render(duration); } finally { close(); }
          return;
        }
        const interval = innerWidth < 600 ? 1000 / 30 : 1000 / 60;
        if (now - lastPaint >= interval - .8) {
          try { render(time); } catch {
            stop();
            staticCard('动画暂时无法绘制，已显示个人标识。');
            return;
          }
          lastPaint = now;
        }
        request = requestAnimationFrame(frame);
      };
      render(0);
      window.SpikeIntroGate?.release();
      skip.focus({preventScroll:true});
      startSound(0);
      request = requestAnimationFrame(frame);
      return true;
    } catch {
      if (currentRun !== run || !dialog.open) return false;
      stop();
      staticCard('动画暂时无法绘制，已显示个人标识。');
      return true;
    }
  }
  dialog.addEventListener('cancel', event => { event.preventDefault(); finish(); });
  dialog.addEventListener('close', () => { if (!dialog.open && state !== 'idle') release(); });
  skip.addEventListener('click', () => finish());
  replay.addEventListener('click', () => { soundWanted = true; play(); });
  soundButton.addEventListener('click', () => {
    if (soundButton.getAttribute('aria-pressed') === 'true') { soundWanted = false; stopSound(false); }
    else { soundWanted = true; startSound(elapsed); }
  });
  audio.addEventListener('error', () => {
    stopSound();
    soundHint.textContent = '音效暂时无法读取，动画仍可正常播放。';
    soundHint.hidden = !dialog.open;
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) finish(true); });
  window.addEventListener('pagehide', () => { if (dialog.open) finish(true); });
  window.addEventListener('resize', () => scene?.resize());
  reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) finish(true); });
  const api = Object.freeze({
    play,
    skip: () => finish(),
    duration,
    get state() { return state; },
    get playing() { return dialog.open && state !== 'closing'; },
    get elapsed() { return elapsed; },
    get frameCount() { return frameCount; },
    get sceneSampled() { return !!scene?.sampled; },
    get soundPlaying() { return !audio.paused && !audio.muted && audio.readyState >= 2 && soundButton.getAttribute('aria-pressed') === 'true'; },
    get soundBlocked() { return soundBlocked; },
    get soundTime() { return audio.currentTime; }
  });
  window.SpikePersonalIntro = api;
  window.SpikeSiteIntro = api;
  if (!seen && !reducedMotion.matches) play();
  else {
    window.SpikeIntroGate?.release();
    if (reducedMotion.matches) showNotice('已按“减少动态效果”设置跳过开屏。点击重播可查看静态个人标识。');
  }
})();

