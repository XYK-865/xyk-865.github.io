(() => {
  'use strict';
  const script = new URL(document.currentScript.src);
  const version = script.searchParams.get('v');
  const asset = name => {
    const url = new URL(name, script);
    if (version) url.searchParams.set('v', version);
    return url.href;
  };
  window.DeepSpaceTextures = Object.freeze({
    base: asset('deep-space-base.webp'),
    flow: asset('deep-space-flow.png'),
    layer0: asset('deep-space-layer0.webp'),
    layer1: asset('deep-space-layer1.webp'),
    layer2: asset('deep-space-layer2.webp')
  });
  window.DeepSpacePreviewTextures = Object.freeze({
    layer0: asset('deep-space-layer0-preview.webp'),
    layer1: asset('deep-space-layer1-preview.webp'),
    layer2: asset('deep-space-layer2-preview.webp')
  });
})();
