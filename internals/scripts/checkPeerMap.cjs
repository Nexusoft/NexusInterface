const assert = require('assert/strict');
const fs = require('fs');
const vm = require('vm');
const babel = require('@babel/core');
const THREE = require('three');
function load(file, mocks = {}) {
  const code = babel.transformSync(fs.readFileSync(file, 'utf8'), {
    configFile: false, babelrc: false,
    presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
  }).code;
  const module = { exports: {} };
  vm.runInNewContext(code, { module, exports: module.exports,
    require: name => mocks[name] || (name === './mapProjection' ? load('src/App/Overview/mapProjection.js') : require(name)), setTimeout });
  return module.exports.default || module.exports;
}
const { mapX } = load('src/App/Overview/mapProjection.js');
assert(mapX(-175) > 300, 'Eastern Russia remains on the right');
assert.equal(mapX(-180), mapX(180), 'Antimeridian coordinates remain contiguous');
assert.equal(mapX(-179) - mapX(179), 4);
const Point = load('src/App/Overview/Point.js');
const makeMaterial = load('src/App/Overview/PeerMapMaterial.js');
const material = makeMaterial(new THREE.Texture());
assert.equal(material.transparent, true);
assert.equal(material.uniforms.longitudeOffset.value, 12 / 360);
assert.equal(material.depthWrite, false);
const Curve = load('src/App/Overview/Curve.js', { 'd3-geo': { geoInterpolate() { throw Error('Map must use planar coordinates'); } } });
const west = new Point(40, -100, { mapLayout: true, peerConnections: 1 });
assert.equal(west.pillar.geometry.type, 'BoxGeometry');
const east = new Point(-30, 120, { mapLayout: true, peerConnections: 1 });
assert.deepEqual(west.pillar.position.toArray(), [-224, 9, -80]);
assert.deepEqual(east.pillar.position.toArray(), [216, 9, 60]);
assert.equal(west.pillar.geometry.parameters.width, 2);
assert.equal(west.pillar.position.y - west.pillar.geometry.parameters.height / 2, 0, 'Larger pillars remain grounded on the map');
const curve = new Curve(west, east, { forward: true });
const vertices = curve.arc.geometry.attributes.position;
assert.equal(vertices.getX(0), -224);
assert.equal(vertices.getZ(0), -80);
assert.equal(vertices.getX(49), 216);
assert.equal(vertices.getZ(49), 60);
assert(vertices.getY(25) > 50, 'Connections arch above the map');
const globe = new Point(40, -100, { peerConnections: 1 });
assert(Math.abs(globe.pillar.position.length() - 125) < 0.001);
const source = fs.readFileSync('src/App/Overview/Globe.js', 'utf8');
const ast = babel.parseSync(source, { configFile:false, babelrc:false, presets:['@babel/preset-react'] });
const ipFunction = ast.program.body.find(n => n.type === 'FunctionDeclaration' && n.id.name === 'peerIP');
const ipSandbox = { isIP: require('net').isIP };
vm.runInNewContext(source.slice(ipFunction.start, ipFunction.end) + '; this.parse = peerIP;', ipSandbox);
assert.equal(ipSandbox.parse('1.2.3.4:9888'), '1.2.3.4');
assert.equal(ipSandbox.parse('[2001:db8::1]:9888'), '2001:db8::1');
assert.equal(ipSandbox.parse('2001:db8::1'), '2001:db8::1');
const cls = ast.program.body.find(n => n.type === 'ExportDefaultDeclaration').declaration;
const methods = cls.body.body.filter(n => ['resizeGlobe', 'addPeerPulse', 'animatePeerPulses', 'registerPeers', 'componentDidUpdate'].includes(n.key?.name)).map(n => source.slice(n.start,n.end)).join('\n');
const sandbox = { Color: require('color'), THREE, Point, mapX, peerIP: ipSandbox.parse, geoip: { get: address => ({location: {latitude: 40, longitude: address === '1.2.3.4' ? -100 : 20}}) }, performance: { now: () => 0 } };
vm.runInNewContext(`class View { ${methods} } this.View = View`, sandbox);
const view = new sandbox.View();
Object.assign(view, { props:{ modern:true, mapLayout:true, pillarColor:'#25ff00' }, camera:new THREE.PerspectiveCamera(45, 1, .1, 10000), renderer:{setSize(){}}, controls:{target:new THREE.Vector3()}, globe:new THREE.Group(), peerPulses:[], threeRootElement:{clientWidth:1000,clientHeight:500} });
view.resizeGlobe();
assert.equal(view.camera.aspect, 2);
assert(Math.abs(view.controls.maxDistance - view.camera.position.distanceTo(view.controls.target)) < 1e-8, 'Initial map view is the zoom-out limit');
view.camera.updateMatrixWorld();
const north = new THREE.Vector3(0, 0, -180).project(view.camera);
const south = new THREE.Vector3(0, 0, 120).project(view.camera);
assert(Math.abs(north.y + south.y) < 1e-8, 'Visible map is vertically centered in perspective');
assert(Number.isFinite(view.camera.position.length()));
view.addPeerPulse(40, -100);
assert.deepEqual(view.peerPulses[0].mesh.position.toArray(), [-224, 2, -80]);
view.animatePeerPulses(600);
assert(view.peerPulses[0].mesh.children[0].material.opacity > 0);
view.animatePeerPulses(5000);
assert.equal(view.peerPulses.length, 0);
assert.equal(view.globe.children.length, 0);
// Check actual arrivals, not just the ring animation in isolation.
Object.assign(view, { pointRegistry: [], allPoints:new THREE.Group(), arcRegister(){}, destroyPoint(){} });
view.registerPeers([{ address:'1.2.3.4:9888' }]);
assert.equal(view.peerPulses.length, 0, 'Initial peers establish a baseline without pulses');
view.registerPeers([{ address:'1.2.3.4:9888' }, { address:'5.6.7.8:9888' }]);
assert.equal(view.peerPulses.length, 1, 'A newly connected peer triggers the globe ring pulse');
view.registerPeers([{ address:'1.2.3.4:9888' }, { address:'5.6.7.8:9888' }]);
assert.equal(view.peerPulses.length, 1, 'Unchanged peers do not replay arrival pulses');
assert.equal(view.peerPulses[0].mesh.children.length, 2);
assert(view.peerPulses[0].mesh.children.every(ring => ring.renderOrder > 0), 'Rings render after the transparent map');
// A remounted overview starts with no local baseline, even with cached peers.
view.peerAddresses = null;
view.peerPulses = [];
view.registerPeers([{ address:'1.2.3.4:9888' }, { address:'5.6.7.8:9888' }]);
assert.equal(view.peerPulses.length, 0, 'Returning to overview does not pulse existing peers');
view.registerPeers([{ address:'1.2.3.4:9888' }]);
assert.equal(view.peerPulses.length, 0, 'Removing peers does not pulse');
view.registerPeers([{ address:'1.2.3.4:9888' }, { address:'5.6.7.8:9888' }]);
assert.equal(view.peerPulses.length, 1, 'A peer rejoining after removal pulses');
console.log('PASS: map coordinates, raised connection arcs, globe projection, responsive camera, pulse animation and disposal.');

for (const [width, height] of [[1200, 300], [1000, 500], [400, 600]]) {
  view.threeRootElement.clientWidth = width;
  view.threeRootElement.clientHeight = height;
  view.resizeGlobe();
  let extent = 0;
  for (const x of [-360, 360]) for (const z of [-180, 120]) {
    const point = new THREE.Vector3(x, 0, z).project(view.camera);
    extent = Math.max(extent, Math.abs(point.x), Math.abs(point.y));
  }
  assert(Math.abs(extent - 0.95) < 0.001, 'Map fills its container without clipping');
}
assert(!source.includes('attachMapZoom'), 'No cursor zoom handler is installed');
const themed = makeMaterial(new THREE.Texture(), '#ff0000', '#00ff00');
assert.equal(themed.uniforms.landColor.value.getHexString(), 'ff0000');
assert.equal(themed.uniforms.glowColor.value.getHexString(), '00ff00');
console.log('PASS: responsive container fitting, disabled map zoom, and theme color uniforms.');

view.props = { mapLayout:true, mapColor:'#ff0000', mapGlowColor:'#00ff00', pillarColor:'#112233', archColor:'#abcdef' };
view.globe = new THREE.Group();
view.globe.add(new THREE.Mesh(new THREE.PlaneGeometry(1, 1), themed));
view.pointRegistry = [west];
view.curveRegistry = [curve];
view.peerPulses = [];
view.componentDidUpdate({});
assert.equal(themed.uniforms.landColor.value.getHexString(), 'ff0000');
assert.equal(themed.uniforms.glowColor.value.getHexString(), '00ff00');
assert.equal(west.pillar.material.color.getHexString(), '112233');
assert.equal(curve.arc.material.color.getHexString(), 'abcdef');
console.log('PASS: independent map colors update existing land, outlines, pillars, and arcs.');

for (const alpha of [0, 0.5, 1]) {
  const color = `rgba(0, 255, 255, ${alpha})`;
  const point = new Point(0, 0, { color, peerConnections: 1 });
  assert.equal(point.pillar.material.opacity, alpha);
  point.setColor('#00ffff');
  assert.equal(point.pillar.material.opacity, 1);
  const map = makeMaterial(new THREE.Texture(), color, color);
  assert.equal(map.uniforms.landOpacity.value, alpha);
  assert.equal(map.uniforms.glowOpacity.value, alpha);
  const arc = new Curve(west, east, { color });
  assert.equal(arc.arc.material.opacity, 0.6 * alpha);
  view.props = { mapLayout: true, mapColor: color, mapGlowColor: color, pillarColor: color, archColor: color };
  view.componentDidUpdate({});
  assert.equal(themed.uniforms.landOpacity.value, alpha);
  assert.equal(west.pillar.material.opacity, alpha);
  assert.equal(curve.arc.material.opacity, 0.6 * alpha);
  view.addPeerPulse(0, 0);
  view.animatePeerPulses(600);
  assert.equal(view.peerPulses.at(-1).mesh.children[0].material.opacity, 0.5 * alpha);
  view.animatePeerPulses(5000);
}
console.log('PASS: transparent, partial, and opaque map, pillar, and arc colors.');

view.props = { globeColor: 'rgba(0, 255, 255, 0.25)', pillarColor: '#ffffff', archColor: '#ffffff' };
view.globe = new THREE.Group();
view.globe.add(new THREE.Mesh(new THREE.SphereGeometry(1), new THREE.MeshBasicMaterial({ transparent: true })));
view.globeGrid = new THREE.Mesh(new THREE.SphereGeometry(1), new THREE.MeshBasicMaterial({ transparent: true }));
view.componentDidUpdate({ globeColor: '#00ffff' });
assert.equal(view.globe.children[0].material.opacity, 0.25);
assert.equal(view.globeGrid.material.opacity, 0.03);
console.log('PASS: live opacity updates and pulse animation retain selected alpha.');
