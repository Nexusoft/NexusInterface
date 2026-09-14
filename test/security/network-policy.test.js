'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const {
  EXTERNAL_ICON_REQUEST_OPTIONS,
  PUBLIC_GEO_IP_URL,
  getPublicGeoIpRequestOptions,
  parsePublicGeoIpResponse,
} = require('../../src/main/ipc/networkPolicy');

test('public GeoIP requests use HTTPS and reject redirects', () => {
  assert.equal(new URL(PUBLIC_GEO_IP_URL).protocol, 'https:');
  const options = getPublicGeoIpRequestOptions();
  assert.equal(options.redirect, 'error');
  assert.ok(options.signal);
  assert.equal(EXTERNAL_ICON_REQUEST_OPTIONS.maxRedirects, 0);
});

test('public GeoIP responses reject malformed and failed payloads', () => {
  assert.deepEqual(
    parsePublicGeoIpResponse({
      latitude: 12.34,
      longitude: -56.78,
      timezone: { id: 'Etc/UTC' },
    }),
    {
      latitude: 12.34,
      longitude: -56.78,
      timeZone: 'Etc/UTC',
    }
  );

  assert.throws(() => JSON.parse('{"latitude":'), SyntaxError);
  for (const response of [
    null,
    [],
    { success: false },
    { latitude: 'unknown', longitude: 1 },
    { latitude: 1, longitude: undefined },
  ]) {
    assert.throws(() => parsePublicGeoIpResponse(response), /response is invalid/);
  }
});
