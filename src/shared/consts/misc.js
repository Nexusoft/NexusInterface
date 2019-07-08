export const webGLAvailable = (() => {
  try {
    var canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch (err) {
    return false;
  }
})();
