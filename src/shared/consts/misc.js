import settings from 'data/initialSettings';

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

export const legacyMode = settings.legacyMode;

// export const tritiumUpgradeTime = Date.now() + 5000;

export const tritiumUpgradeTime = new Date(2019, 8, 30).getTime();
