'use strict';

const PUBLIC_GEO_IP_URL = 'https://ipwho.is/';
const EXTERNAL_ICON_REQUEST_OPTIONS = Object.freeze({
  maxContentLength: 1024 * 1024,
  maxRedirects: 0,
  responseType: 'text',
  timeout: 10000,
  validateStatus: (status) => status >= 200 && status < 300,
});

function getPublicGeoIpRequestOptions() {
  return {
    redirect: 'error',
    signal: AbortSignal.timeout(10000),
  };
}

function parsePublicGeoIpResponse(result) {
  if (!result || typeof result !== 'object' || Array.isArray(result) || result.success === false) {
    throw new Error('Public Geo IP response is invalid');
  }
  const latitude = Number(result.latitude);
  const longitude = Number(result.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error('Public Geo IP response is invalid');
  }
  return {
    latitude,
    longitude,
    timeZone: typeof result.timezone?.id === 'string' ? result.timezone.id : '',
  };
}

module.exports = {
  EXTERNAL_ICON_REQUEST_OPTIONS,
  PUBLIC_GEO_IP_URL,
  getPublicGeoIpRequestOptions,
  parsePublicGeoIpResponse,
};
