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

export const legacyMode = settings.legacyMode === false ? false : true;

// 11/11/2019 11:11 PM AZ time (UTC-7)
export const tritiumUpgradeTime = new Date(
  Date.UTC(2019, 10, 12, 6, 11, 0)
).getTime();

// https://github.com/sindresorhus/semver-regex
export const semverRegex = /(?<=^v?|\sv?)(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-(?:[1-9]\d*|[\da-z-]*[a-z-][\da-z-]*)(?:\.(?:[1-9]\d*|[\da-z-]*[a-z-][\da-z-]*))*)?(?:\+[\da-z-]+(?:\.[\da-z-]+)*)?(?=$|\s)/gi;
