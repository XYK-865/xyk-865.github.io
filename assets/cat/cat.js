/* Adapted from oneko.js by adryd (MIT). See LICENSE-oneko.txt. */
(() => {
  'use strict';
  if (window.SpikeCat || document.getElementById('spike-cat')) return;
  const pointer = matchMedia('(hover: hover) and (pointer: fine)');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const spriteURL = new URL('oneko.gif', document.currentScript.src).href;
  const storageKey = 'spike-cat-enabled';
  const stateKey = 'spike-cat-state-v1';
  const controls = 'button,input,textarea,select,summary,[role="button"],[contenteditable]:not([contenteditable="false"]),iframe,video[controls],audio[controls]';
  const cat = document.createElement('div');
  cat.id = 'spike-cat';
  cat.hidden = true;
  cat.setAttribute('aria-hidden', 'true');
  const toggle = document.createElement('button');
  toggle.id = 'spike-cat-toggle';
  toggle.type = 'button';
  toggle.title = '移动鼠标，小猫会追过来；再次点击可关闭';
  (document.querySelector('#site-footer') || document.body).append(toggle);
  document.body.append(cat);

  const frames = {
    idle: [[-3,-3]], alert: [[-7,-3]],
    scratch: [[-5,0],[-6,0],[-7,0]],
    tired: [[-3,-2]], sleep: [[-2,0],[-2,-1]],
    N: [[-1,-2],[-1,-3]], NE: [[0,-2],[0,-3]],
    E: [[-3,0],[-3,-1]], SE: [[-5,-1],[-5,-2]],
    S: [[-6,-3],[-7,-2]], SW: [[-5,-3],[-6,-1]],
    W: [[-4,-2],[-4,-3]], NW: [[-1,0],[-1,-1]]
  };
  let x = 52, y = Math.max(100, innerHeight - 70), targetX = x, targetY = y;
  let enabled = true, running = false, pageActive = true, spriteLoaded = false;
  let request = 0, timer = 0, frame = 0, idleTicks = 0, alertTicks = 0;
  let restored = false, restoredSprite = 'idle';
  let velocityX = 0, velocityY = 0, lastTick = 0, lastSpriteTime = 0;
  let destination = {x,y,radius:40}, avoidanceElement = null, avoidanceSide = null;
  const maxSpeed = 155, acceleration = 700;
  const allowed = () => pointer.matches && !motion.matches;
  const blocked = () => !pageActive || document.hidden || !!document.querySelector('dialog[open]') || document.body.classList.contains('video-intro-open');
  function readPreference() {
    try { enabled = localStorage.getItem(storageKey) !== 'false'; } catch { /* Keep the current in-memory choice. */ }
  }
  readPreference();

  try {
    const saved = JSON.parse(sessionStorage.getItem(stateKey));
    if (saved?.version === 1 && ['x','y','targetX','targetY'].every(key => Number.isFinite(saved[key]))) {
      ({x,y,targetX,targetY} = saved);
      frame = Number.isInteger(saved.frame) && saved.frame >= 0 ? saved.frame : 0;
      idleTicks = Number.isInteger(saved.idleTicks) && saved.idleTicks >= 0 ? saved.idleTicks : 0;
      alertTicks = Number.isInteger(saved.alertTicks) && saved.alertTicks >= 0 ? saved.alertTicks : 0;
      restoredSprite = Object.hasOwn(frames, saved.state) ? saved.state : 'idle';
      restored = true;
    }
  } catch { /* A fresh page remains usable without session storage. */ }
  function remember() {
    try { sessionStorage.setItem(stateKey, JSON.stringify({version:1,x,y,targetX,targetY,frame,idleTicks,alertTicks,state:cat.dataset.state})); } catch {}
  }

  function sprite(name, index = 0) {
    const [sx, sy] = frames[name][index % frames[name].length];
    cat.style.backgroundPosition = sx * 32 + 'px ' + sy * 32 + 'px';
    cat.dataset.state = name;
  }
  function place() {
    const maxX = Math.max(16, innerWidth - 16), maxY = Math.max(16, innerHeight - 16);
    x = Math.max(16, Math.min(x, maxX)); y = Math.max(16, Math.min(y, maxY));
    targetX = Math.max(16, Math.min(targetX, maxX)); targetY = Math.max(16, Math.min(targetY, maxY));
    cat.style.transform = 'translate3d(' + (x - 16) + 'px,' + (y - 16) + 'px,0)';
  }
  function controlAt(px, py) {
    const element = document.elementFromPoint(px, py);
    const control = element?.closest(controls) || element?.closest('a[href],[role="link"]');
    const group = element?.closest('.contact-row');
    if (!control && !group) return null;
    let rect = control?.getBoundingClientRect();
    // A project card can fill most of the screen. Its whole surface must not hide the cat.
    if (control && !control.matches(controls) && (rect.width > 260 || rect.height > 80)) return null;
    if (group) {
      const bounds = [...group.querySelectorAll('a')].map(link => link.getBoundingClientRect()).filter(bound => bound.width && bound.height);
      if (!bounds.length) return null;
      rect = {left:Math.min(...bounds.map(bound => bound.left)),right:Math.max(...bounds.map(bound => bound.right)),top:Math.min(...bounds.map(bound => bound.top)),bottom:Math.max(...bounds.map(bound => bound.bottom))};
      if (px < rect.left || px > rect.right || py < rect.top || py > rect.bottom) return null;
    }
    return {element:group || control,rect,group:!!group};
  }
  function clearPoint(obstacle, px, py, preferred, side) {
    const {rect,group} = obstacle;
    const clampX = value => Math.max(16, Math.min(value, innerWidth - 16));
    const clampY = value => Math.max(16, Math.min(value, innerHeight - 16));
    const choices = [[rect.left-24,py,'left'],[rect.right+24,py,'right'],[px,rect.top-24,'top'],[px,rect.bottom+24,'bottom']]
      .filter(([, ,edge]) => !group || edge === 'top' || edge === 'bottom')
      .map(([cx,cy,edge]) => ({x:clampX(cx),y:clampY(cy),side:edge}))
      .filter(point => point.x+16 < rect.left || point.x-16 > rect.right || point.y+16 < rect.top || point.y-16 > rect.bottom);
    choices.sort((a,b) => Math.hypot(a.x-preferred.x,a.y-preferred.y)-Math.hypot(b.x-preferred.x,b.y-preferred.y));
    return choices.find(point => point.side === side) || choices[0] || null;
  }
  function goal() {
    const hovered = controlAt(targetX,targetY);
    if (hovered) {
      // Keep the same side across adjacent social icons instead of bouncing between gaps.
      const point = clearPoint(hovered,targetX,targetY,{x,y},hovered.element === avoidanceElement ? avoidanceSide : null);
      if (point) {
        avoidanceElement = hovered.element; avoidanceSide = point.side;
        return {...point,radius:2};
      }
    }
    avoidanceElement = avoidanceSide = null;
    for (const [px,py] of [[x,y],[x-15,y-15],[x+15,y-15],[x-15,y+15],[x+15,y+15]]) {
      const obstacle = controlAt(px,py);
      const point = obstacle && clearPoint(obstacle,x,y,{x:targetX,y:targetY});
      if (point) return {...point,radius:2};
    }
    return {x:targetX,y:targetY,radius:40};
  }
  function advance(seconds) {
    const dx = destination.x - x, dy = destination.y - y, distance = Math.hypot(dx, dy);
    const remaining = distance - destination.radius;
    if (remaining <= .5) { velocityX = velocityY = 0; return false; }
    if (idleTicks > 2) alertTicks = 2;
    idleTicks = 0;
    if (alertTicks > 0) return true;
    const speed = Math.min(maxSpeed,Math.sqrt(2 * acceleration * remaining));
    const changeX = dx / distance * speed - velocityX, changeY = dy / distance * speed - velocityY;
    const change = Math.hypot(changeX,changeY), blend = change ? Math.min(1,acceleration * seconds / change) : 0;
    velocityX += changeX * blend; velocityY += changeY * blend;
    const step = Math.hypot(velocityX,velocityY) * seconds;
    if (step > remaining) {
      x += dx / distance * remaining; y += dy / distance * remaining;
      velocityX = velocityY = 0;
    } else { x += velocityX * seconds; y += velocityY * seconds; }
    place();
    return true;
  }
  function animateSprite(moving) {
    frame++;
    if (!moving) {
      idleTicks++;
      if (idleTicks > 85) sprite('sleep', Math.floor(frame / 4));
      else if (idleTicks > 75) sprite('tired');
      else if (idleTicks > 20 && idleTicks < 35) sprite('scratch', frame);
      else sprite('idle');
    } else if (alertTicks > 0) { alertTicks--; sprite('alert'); }
    else {
      const speed = Math.hypot(velocityX,velocityY);
      if (speed < 1) return;
      let direction = velocityY / speed < -.5 ? 'N' : velocityY / speed > .5 ? 'S' : '';
      direction += velocityX / speed < -.5 ? 'W' : velocityX / speed > .5 ? 'E' : '';
      sprite(direction,frame);
    }
  }
  function stop() {
    running = false;
    clearTimeout(timer); cancelAnimationFrame(request);
    timer = request = 0;
    lastTick = lastSpriteTime = 0;
    velocityX = velocityY = 0;
  }
  function tick(timestamp) {
    request = 0;
    if (!enabled || !allowed() || blocked()) { sync(); return; }
    // Clamp elapsed time after stalls: never make a large catch-up jump.
    const seconds = lastTick ? Math.min((timestamp-lastTick)/1000,.034) : 1/60;
    lastTick = timestamp;
    const spriteDue = !lastSpriteTime || timestamp-lastSpriteTime >= 100;
    if (spriteDue) destination = goal();
    const moving = advance(seconds);
    if (spriteDue) {
      animateSprite(moving); lastSpriteTime = timestamp;
      if (frame % 10 === 0) remember();
    }
    if (moving) { request = requestAnimationFrame(tick); return; }
    timer = setTimeout(() => {
      timer = 0;
      if (running) request = requestAnimationFrame(tick);
    }, 100);
  }
  function sync() {
    const eligible = allowed(), visible = enabled && eligible && !blocked();
    cat.hidden = !visible;
    toggle.hidden = !eligible;
    toggle.textContent = enabled ? '小猫：开' : '小猫：关';
    toggle.setAttribute('aria-pressed', String(enabled));
    toggle.setAttribute('aria-label', enabled ? '关闭跟随鼠标的小猫' : '开启跟随鼠标的小猫');
    if (visible && !spriteLoaded) {
      cat.style.backgroundImage = 'url("' + spriteURL + '")';
      spriteLoaded = true;
    }
    if (!visible) stop();
    else if (!running) { running = true; request = requestAnimationFrame(tick); }
  }
  function setEnabled(value) {
    enabled = Boolean(value);
    try { localStorage.setItem(storageKey, String(enabled)); } catch { /* The switch still works when storage is unavailable. */ }
    sync();
    remember();
  }
  document.addEventListener('pointermove', event => {
    if (event.pointerType && event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
    targetX = Math.max(16, Math.min(event.clientX, innerWidth - 16));
    targetY = Math.max(16, Math.min(event.clientY, innerHeight - 16));
  }, {passive:true});
  document.addEventListener('click', event => { if (event.target instanceof Element && event.target.closest('a[href]')) remember(); }, {capture:true,passive:true});
  toggle.addEventListener('click', () => setEnabled(!enabled));
  addEventListener('resize', () => { place(); destination = goal(); }, {passive:true});
  addEventListener('storage', event => { if (event.key === storageKey || event.key === null) { readPreference(); sync(); } });
  addEventListener('pagehide', () => { remember(); pageActive = false; sync(); });
  addEventListener('pageshow', () => { pageActive = true; sync(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) remember(); sync(); });
  pointer.addEventListener('change', sync);
  motion.addEventListener('change', sync);
  new MutationObserver(sync).observe(document.body, {subtree:true, attributes:true, attributeFilter:['open','class']});

  window.SpikeCat = Object.freeze({
    setEnabled,
    get enabled() { return enabled; },
    get allowed() { return allowed(); },
    get running() { return running; },
    get frameCount() { return frame; },
    get state() { return cat.dataset.state; },
    get restored() { return restored; },
    get position() { return {x,y}; },
    get target() { return {x:targetX,y:targetY}; }
  });
  sprite(restoredSprite,frame); place(); sync(); remember();
})();
