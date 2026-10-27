(() => {
  'use strict';
  delete document.documentElement.dataset.theme;
  const canvas = document.querySelector('.cosmos-galaxy');
  if (!canvas) return;
  const assets = window.DeepSpaceTextures;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let renderer = 'static-reference', running = false, ready = false;
  let frameCount = 0, loaded = 0, fullLoaded = 0, request = 0, seconds = 0, last = 0;
  let initialized = false;
  let width = 1, height = 1, draw;
  const hero = canvas.closest('.console-hero');
  canvas.style.opacity = '0';
  if (assets?.base) {
    hero.style.backgroundImage = `url("${assets.base}")`;
    hero.style.backgroundSize = 'cover';
    hero.style.backgroundPosition = 'center';
  }
  Object.defineProperty(window, 'PersonalCosmosScene', {value:Object.freeze({
    get renderer() { return renderer; },
    get running() { return running; },
    get ready() { return ready; },
    get frameCount() { return frameCount; },
    get layersLoaded() { return loaded; },
    get fullResolutionLayers() { return fullLoaded; },
    get elapsed() { return seconds; }
  })});
  function visible() {
    const rect = hero.getBoundingClientRect();
    return rect.bottom > 0 && rect.top < innerHeight && rect.right > 0 && rect.left < innerWidth;
  }
  function shouldRun() {
    return ready && renderer === 'webgl-flow' && !motion.matches && !document.hidden &&
      !document.body.classList.contains('video-intro-open') && visible();
  }
  function stop() {
    running = false;
    cancelAnimationFrame(request);
    request = 0;
    last = 0;
  }
  function tick(now) {
    if (!shouldRun()) { stop(); return; }
    const interval = 1000 / (innerWidth < 650 ? 20 : 30);
    if (!last || now - last >= interval) {
      if (last) seconds += Math.min((now - last) / 1000, .15);
      last = now;
      draw(seconds);
    }
    request = requestAnimationFrame(tick);
  }
  function sync() {
    if (!shouldRun()) stop();
    else if (!running) { running = true; last = 0; request = requestAnimationFrame(tick); }
  }
  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, rect.width); height = Math.max(1, rect.height);
    const dpr = Math.min(devicePixelRatio || 1, 1.25);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    if (ready && draw) draw(motion.matches ? 0 : seconds);
    sync();
  }
  function fallback() {
    renderer = 'static-reference'; ready = true;
    canvas.style.opacity = '0'; canvas.dataset.ready = 'true';
    stop();
  }
  async function initialize() {
    if (!assets) { fallback(); return; }
    try {
      const gl = canvas.getContext('webgl', {alpha:false, antialias:false, preserveDrawingBuffer:true});
      if (!gl) { fallback(); return; }
      const vertex = `attribute vec2 position; varying vec2 uv; void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}`;
      const fragment = `precision mediump float;
        varying vec2 uv;
        uniform sampler2D baseImage,flowImage,cloud0,cloud1,cloud2;
        uniform float time; uniform vec2 crop; uniform float shift;
        vec4 flowing(sampler2D image,vec2 p,vec2 direction,float speed,float phase){
          float a=fract(time*speed+phase),b=fract(time*speed+phase+.5);
          return mix(texture2D(image,p+direction*.1*a),texture2D(image,p+direction*.1*b),2.*abs(a-.5));
        }
        void main(){
          vec2 p=(uv-.5)*crop+vec2(.5-shift,.5);
          vec2 direction=(texture2D(flowImage,p).rg-.5)*2.;
          vec4 clouds=flowing(cloud0,p,direction,.01,0.);
          vec4 next=flowing(cloud1,p,direction,.02,0.);
          clouds.rgb=mix(clouds.rgb,next.rgb,next.a);clouds.a=max(clouds.a,next.a);
          next=flowing(cloud2,p,direction,.04,.3333);
          clouds.rgb=mix(clouds.rgb,next.rgb,next.a);clouds.a=max(clouds.a,next.a);
          vec3 base=texture2D(baseImage,p).rgb;
          gl_FragColor=vec4(mix(base,clouds.rgb,clouds.a),1.);
        }`;
      function shader(type, source) {
        const object = gl.createShader(type);
        gl.shaderSource(object, source); gl.compileShader(object);
        if (!gl.getShaderParameter(object, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(object));
        return object;
      }
      const program = gl.createProgram();
      gl.attachShader(program, shader(gl.VERTEX_SHADER, vertex));
      gl.attachShader(program, shader(gl.FRAGMENT_SHADER, fragment));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
      gl.useProgram(program);
      const geometry = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, geometry);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
      const position = gl.getAttribLocation(program, 'position');
      gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
      const names = ['baseImage','flowImage','cloud0','cloud1','cloud2'];
      const keys = ['base','flow','layer0','layer1','layer2'];
      const textures = keys.map((key,index) => {
        const texture = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0 + index); gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([0,0,0,0]));
        gl.uniform1i(gl.getUniformLocation(program,names[index]),index);
        return texture;
      });
      const populated = new Set(), originals = new Set();
      function useImage(image,index,original) {
        if (gl.isContextLost()) return;
        gl.activeTexture(gl.TEXTURE0 + index); gl.bindTexture(gl.TEXTURE_2D,textures[index]);
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);
        populated.add(index); loaded = populated.size;
        if (original) { originals.add(index); fullLoaded = originals.size; }
        if (ready && draw) draw(motion.matches ? 0 : seconds);
      }
      function image(source,priority='high',timeout=20000) {
        return new Promise((resolve,reject) => {
          const value = new Image(); value.fetchPriority = priority; value.decoding = 'async';
          const timer = setTimeout(() => { value.onload = value.onerror = null; value.src = ''; reject(new Error('Texture load timed out')); },timeout);
          value.onload = () => { clearTimeout(timer); resolve(value); };
          value.onerror = () => { clearTimeout(timer); reject(new Error('Texture unavailable')); };
          value.src = source;
        });
      }
      const essential = await Promise.all([image(assets.base),image(assets.flow)]);
      essential.forEach((value,index) => useImage(value,index,true));
      const clock = gl.getUniformLocation(program,'time');
      const crop = gl.getUniformLocation(program,'crop');
      const shift = gl.getUniformLocation(program,'shift');
      draw = time => {
        gl.viewport(0,0,canvas.width,canvas.height);
        const imageAspect = 1920/1080, aspect = width/height;
        gl.uniform2f(crop, Math.min(1,aspect/imageAspect),Math.min(1,imageAspect/aspect));
        gl.uniform1f(shift, innerWidth < 650 ? 0 : .13);
        gl.uniform1f(clock,time);
        gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
        canvas.dataset.ready = 'true'; frameCount++;
      };
      renderer = 'webgl-flow'; ready = true; resize();
      canvas.style.transition = 'opacity .8s ease'; canvas.style.opacity = '1';
      canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); fallback(); });
      // Start with small versions of the same clouds; one slow original must not
      // hold the other layers or the whole animation behind Promise.all.
      keys.slice(2).forEach((key,offset) => {
        const index = offset + 2, preview = window.DeepSpacePreviewTextures?.[key];
        const full = () => image(assets[key],'low',45000).then(value => useImage(value,index,true)).catch(() => {});
        if (!preview) { full(); return; }
        image(preview).then(value => { useImage(value,index,false); full(); }).catch(full);
      });
    } catch { fallback(); }
  }
  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(sync).observe(hero);
  function begin() {
    if (initialized || document.body.classList.contains('video-intro-open')) return;
    initialized = true;
    initialize();
  }
  new MutationObserver(()=>{sync();begin();}).observe(document.body,{attributes:true,attributeFilter:['class']});
  motion.addEventListener('change',()=>{if(draw&&ready)draw(motion.matches?0:seconds);sync();});
  addEventListener('scroll',sync,{passive:true}); addEventListener('resize',resize,{passive:true});
  addEventListener('pagehide',stop); addEventListener('pageshow',sync);
  document.addEventListener('visibilitychange',sync);
  requestAnimationFrame(begin);
})();
