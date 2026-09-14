/*
  Misc short-hands to use within the wallet.
*/

/**
 * Determines if WEBGL2.0 is available on this system
 */
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

/**
 * Regex to get a SemVer from a string
 * https://github.com/sindresorhus/semver-regex
 */
export const semverRegex =
  /(?<=^v?|\sv?)(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-(?:[1-9]\d*|[\da-z-]*[a-z-][\da-z-]*)(?:\.(?:[1-9]\d*|[\da-z-]*[a-z-][\da-z-]*))*)?(?:\+[\da-z-]+(?:\.[\da-z-]+)*)?(?=$|\s)/gi;

/**
 * Regex to determine if a string appears to be a Nexus ID.
 */
export const userIdRegex = /^[\da-f]+$/;

/**
 * Regex to determine if a string appears to be a Nexus Address.
 */
export const addressRegex = /^[1-9A-HJ-NP-Za-km-z]{51}$/;

/**
 * Regex to determine if a string is an Email.
 */
export const emailRegex =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

/**
 * Number types that an asset can be.
 */
export const assetNumberTypes = [
  'uint8',
  'uint16',
  'uint32',
  'uint64',
  'uint256',
  'uint512',
  'uint1024',
];

/**
 *  Returns true if the APP string contains beta
 */
export const betaRelease = APP_VERSION.toString().includes('beta');

/**
 *  returns true if the APP string contains alpha
 */
export const alphaRelease = APP_VERSION.toString().includes('alpha');

/**
 *  Returns true if the APP string contains beta OR alpha
 */
export const preRelease = alphaRelease || betaRelease || !!LOCK_TESTNET;

/**
 * This will allow us to purge the `_API` folder if needed by core to refresh. Number is not tied to any specific version but must increment up by one.
 */
export const minimumCoreAPIPolicy = 1;
