import { Component } from 'react';
import { createPortal } from 'react-dom';
import * as THREE from 'three';
import styled from '@emotion/styled';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import world from 'icons/world-light-white.jpg';
import geoip from 'data/geoip';
import Curve from './Curve';
import Point from './Point';
import { callAPI } from 'lib/api';
import Color from 'color';

const MaxDisplayPoints = 64;
const peerRefreshMs = 30000;

__ = __context('Overview');

const placeName = (geo) =>
  [geo.city?.names?.en, geo.country?.names?.en].filter(Boolean).join(', ') ||
  geo.location?.time_zone ||
  '';

const NodeTooltip = styled.div(({ theme }) => ({
  position: 'fixed',
  zIndex: 1000,
  pointerEvents: 'none',
  padding: '8px 12px',
  borderRadius: 4,
  fontSize: 13,
  lineHeight: 1.5,
  whiteSpace: 'nowrap',
  background: theme.lower(theme.background, 0.3),
  border: `1px solid ${theme.mixer(0.25)}`,
  color: theme.foreground,
  boxShadow: '0 2px 10px rgba(0,0,0,.5)',
}));

const GlobeContainer = styled.div({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  overflow: 'hidden',
});

/**
 * The 3D Globe on the overview page.
 *
 * @export
 * @class Globe
 * @extends {Component}
 */
export default class Globe extends Component {
  constructor() {
    super();
    this.threeRootElement = null;
    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
    this.animate = this.animate.bind(this);
    this.onWindowResize = this.onWindowResize.bind(this);
    this.animateArcs = this.animateArcs.bind(this);
    this.removeAllPoints = this.removeAllPoints.bind(this);
    this.pointRegister = this.pointRegister.bind(this);
    this.contextLostHandler = this.contextLostHandler.bind(this);
    this.contextRestoredHandler = this.contextRestoredHandler.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.pointRegistry = [];
    this.curveRegistry = [];
    this.selfPoint = null;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.state = { hover: null };
  }

  /**
   * Mounting event from React, used to start the globe up
   *
   * @memberof Globe
   */
  componentDidMount() {
    try {
      this.props.handleOnLineRender(this.animateArcs);
      this.props.handleRemoveAllPoints(this.removeAllPoints);

      const WIDTH = window.innerWidth;
      const HEIGHT = window.innerHeight;
      const VIEW_ANGLE = 45;
      const ASPECT = WIDTH / HEIGHT;
      const NEAR = 0.1;
      const FAR = 10000;

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });
      const camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
      const scene = new THREE.Scene();

      const controls = new OrbitControls(camera, renderer.domElement);
      const globe = new THREE.Group();
      const sphere = new THREE.SphereGeometry(125, 50, 50);
      const allPoints = new THREE.Group();
      const allArcs = new THREE.Group();

      renderer.setClearColor(0x000000, 0);
      renderer.setSize(WIDTH, HEIGHT);
      camera.position.set(0, 235, 500);
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.8;
      controls.enableDamping = true;
      controls.dampingFactor = 0.25;
      controls.minDistance = 300;
      controls.maxDistance = 500;
      controls.enablePan = false;
      // Disabled by default, fixing a bug where the LoginModal input cannot get focused
      controls.enabled = false;
      controls.update();
      scene.add(camera);

      let importworld = new THREE.TextureLoader().load(world);
      importworld.anisotropy = 4;
      const newWorld = new THREE.MeshBasicMaterial({
        map: importworld,
        color: this.props.globeColor,
      });

      const mesh = new THREE.Mesh(sphere, newWorld);

      globe.add(mesh);
      globe.add(allPoints);
      globe.add(allArcs);
      scene.add(globe);

      // Set up Three stuff we want access to
      this.allArcs = allArcs;
      this.allPoints = allPoints;
      this.scene = scene;
      this.camera = camera;
      this.renderer = renderer;
      this.globe = globe;
      this.controls = controls;

      // Add pin for user
      this.addSelfPoint();
      this.pointRegister();

      const context = this.renderer.getContext();

      context.canvas.addEventListener(
        'webglcontextlost',
        this.contextLostHandler,
        false
      );

      context.canvas.addEventListener(
        'webglcontextrestored',
        this.contextRestoredHandler,
        false
      );

      context.canvas.addEventListener(
        'mouseout',
        () => {
          this.controls.enabled = false;
        },
        false
      );

      context.canvas.addEventListener(
        'mouseover',
        () => {
          this.controls.enabled = true;
        },
        false
      );
      context.canvas.addEventListener('mousemove', this.onMouseMove, false);
      context.canvas.addEventListener(
        'mouseleave',
        () => {
          this.mouseClient = null;
          this.setState({ hover: null });
        },
        false
      );
      //peers can change while the connection count stays the same
      this.refreshTimer = setInterval(this.pointRegister, peerRefreshMs);
      this.threeRootElement.appendChild(renderer.domElement);
      window.addEventListener('resize', this.onWindowResize, false);
      this.start();
    } catch (e) {
      console.error(e);
    }
  }
  /**
   * Handle Webgl Context Restore Event
   *
   * @memberof Globe
   */
  contextRestoredHandler() {
    console.error('CONTEXT RESTORED');
    this.start();
    console.error('RESTORED GLOBE');
  }

  /**
   * Handle Webgl Context Lost Event
   *
   * @param {*} event
   * @memberof Globe
   */
  contextLostHandler(event) {
    event.preventDefault();
    console.error('CONTEXT LOST!!');
    this.stop();
  }

  /**
   * Update event from React
   *
   * @param {*} prevProps
   * @memberof Globe
   */
  componentDidUpdate(prevProps) {
    if (geoip == null) {
      return;
    }
    if (this.props.globeColor != prevProps.globeColor) {
      const newColor = new THREE.Color(this.props.globeColor);
      this.globe.children[0].material.color = newColor; // [0] == globe
    }
    if (this.props.connections !== prevProps.connections) {
      this.pointRegister();
    }
    if (this.props.blocks !== prevProps.blocks) {
      this.animateArcs();
    }
  }

  /**
   * Unmount event from React
   *
   * @memberof Globe
   */
  componentWillUnmount() {
    this.stop();
    clearInterval(this.refreshTimer);
    window.removeEventListener('resize', this.onWindowResize, false);
    this.controls.dispose();
    if (this.threeRootElement.children.length > 0) {
      this.threeRootElement.removeChild(this.renderer.domElement);
    }
  }

  /**
   * Register point/pillar on the globe, one per location with all its peers
   *
   * @returns
   * @memberof Globe
   */
  async pointRegister() {
    let peerInfo;
    try {
      peerInfo = await callAPI('system/list/peers', null);
    } catch (err) {}
    if (!peerInfo || !this.allPoints) return;

    //group peers by location, peers without a public location are left out
    const locations = new Map();
    for (const peer of peerInfo) {
      const geo = geoip.get(peer.address.split(':')[0]);
      if (!geo?.location) continue;
      const key = `${geo.location.latitude},${geo.location.longitude}`;
      if (!locations.has(key)) {
        locations.set(key, {
          lat: geo.location.latitude,
          lng: geo.location.longitude,
          place: placeName(geo),
          peers: [],
        });
      }
      locations.get(key).peers.push(peer);
    }
    const wanted = [...locations.values()].slice(0, MaxDisplayPoints);

    const newRegistry = wanted.map((location) => {
      const existing = this.pointRegistry.find(
        (point) => point.lat === location.lat && point.lng === location.lng
      );
      const params = {
        type: 'PEER',
        outgoing: location.peers.some((peer) => peer.outgoing),
        name: location.place,
        peers: location.peers,
        color: this.props.pillarColor,
        peerConnections: location.peers.length,
      };
      //same place and size: keep the pillar, only refresh the peer details
      if (existing && existing.params.peerConnections === params.peerConnections) {
        existing.params = params;
        return existing;
      }
      if (existing) this.destroyPoint(existing);
      const point = new Point(location.lat, location.lng, params);
      point.pillar.userData.point = point;
      this.allPoints.add(point.pillar);
      return point;
    });

    for (const point of this.pointRegistry) {
      if (!newRegistry.includes(point) && point.pillar) this.destroyPoint(point);
    }
    this.pointRegistry = newRegistry;
    this.arcRegister();
  }

  /**
   * Add the pin for this wallet's own location, once
   *
   * @memberof Globe
   */
  async addSelfPoint() {
    if (this.selfPoint || this.selfPending) return;
    this.selfPending = true;
    try {
      let lat, lng, place;
      //the core knows its public address, so the local location database is enough
      try {
        const info = await callAPI('system/get/info');
        const geo = info?.address && geoip.get(String(info.address).split(':')[0]);
        if (geo?.location) {
          lat = geo.location.latitude;
          lng = geo.location.longitude;
          place = placeName(geo);
        }
      } catch (err) {}
      if (lat === undefined && !this.selfLookupTried) {
        this.selfLookupTried = true;
        const response = await fetch('http://ip-api.com/json/?fields=450');
        const data = await response.json();
        lat = parseFloat(data.lat);
        lng = parseFloat(data.lon);
        place = data.timezone;
      }
      if (lat === undefined || Number.isNaN(lat) || !this.allPoints) return;
      const self = new Point(lat, lng, {
        color: new Color(this.props.pillarColor).negate().hex(),
        name: place,
        type: 'SELF',
        peerConnections: 1.5,
      });
      self.pillar.userData.point = self;
      this.selfPoint = self;
      this.allPoints.add(self.pillar);
      this.arcRegister();
    } catch (e) {
      console.error(e);
    } finally {
      this.selfPending = false;
    }
  }

  /**
   * Remove all points on the globe
   *
   * @memberof Globe
   */
  removeAllPoints() {
    [...this.pointRegistry].forEach((point, i) => {
      setTimeout(() => {
        if (point.pillar) this.destroyPoint(point);
      }, i * 50);
    });
    this.pointRegistry = [];
  }

  /**
   * Removes the point and its arcs
   *
   * @param {*} deadPoint Point to remove
   * @memberof Globe
   */
  destroyPoint(deadPoint) {
    this.pointRegistry = this.pointRegistry.filter(
      (point) => point !== deadPoint
    );
    this.allPoints.remove(deadPoint.pillar);
    this.curveRegistry
      .filter(
        (arc) =>
          (arc.pointOne.lat === deadPoint.lat &&
            arc.pointOne.lng === deadPoint.lng) ||
          (arc.pointTwo.lat === deadPoint.lat &&
            arc.pointTwo.lng === deadPoint.lng)
      )
      .forEach((arc) => this.destroyArc(arc));

    deadPoint.pillar.geometry.dispose();
    deadPoint.pillar.material.dispose();
    deadPoint.pillar = undefined;
  }

  /**
   * Register an arc from every peer location to this wallet
   *
   * @memberof Globe
   */
  arcRegister() {
    const self = this.selfPoint;
    if (!self) {
      this.addSelfPoint();
      return;
    }
    this.pointRegistry.forEach((point) => {
      if (point.lat === self.lat && point.lng === self.lng) return;
      const exists = this.curveRegistry.some(
        (curve) =>
          curve.pointOne.lat === point.lat &&
          curve.pointOne.lng === point.lng &&
          curve.pointTwo.lat === self.lat &&
          curve.pointTwo.lng === self.lng
      );
      if (exists) return;
      const arc = new Curve(point, self, {
        color: this.props.archColor,
        forward: point.params.outgoing,
      });
      this.allArcs.add(arc.arc);
      arc.play();
      this.curveRegistry.push(arc);
    });
  }

  /**
   * Show which nodes a pillar stands for when the mouse is over it
   *
   * @param {MouseEvent} event
   * @memberof Globe
   */
  onMouseMove(event) {
    this.mouseClient = { x: event.clientX, y: event.clientY };
    this.updateHover();
  }

  updateHover() {
    if (!this.camera || !this.allPoints || !this.mouseClient) return;
    const { x, y } = this.mouseClient;
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((x - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((y - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const hit = this.raycaster.intersectObjects(this.allPoints.children)[0];
    const point = hit?.object?.userData?.point;
    if (!point) {
      if (this.state.hover) this.setState({ hover: null });
      return;
    }
    const hover = this.state.hover;
    if (hover && hover.point === point && hover.x === x && hover.y === y) return;
    this.setState({ hover: { x, y, point } });
  }


  /**
   * Animate all the Curves on the globe
   *
   * @memberof Globe
   */
  animateArcs() {
    if (this.curveRegistry.length <= 0) return;
    if (this.curveRegistry[0].isPlaying) return;
    this.curveRegistry.map((arc) => {
      if (arc.forward) {
        arc.play();
      }
    });
    setTimeout(() => {
      this.curveRegistry.map((arc) => {
        if (!arc.forward) {
          arc.play();
        }
      });
    }, 2040);
  }

  /**
   * Removes the unused Curve
   *
   * @param {*} deadCurve Curve to remove
   * @memberof Globe
   */
  destroyArc(deadCurve) {
    this.curveRegistry = this.curveRegistry.filter((curve) => {
      if (curve.arc.uuid !== deadCurve.arc.uuid) return curve;
    });

    this.allArcs.remove(deadCurve.arc);
    deadCurve.arc.geometry.dispose();
    deadCurve.arc.material.dispose();
    deadCurve.arc = undefined;
  }

  /**
   * Event when the window resizes
   *
   * @memberof Globe
   */
  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  /**
   * Stop the animation
   *
   * @memberof Globe
   */
  stop() {
    cancelAnimationFrame(this.frameId);
  }

  /**
   * Start the animation
   *
   * @memberof Globe
   */
  start() {
    this.animateArcs();
    if (!this.frameId) {
      this.frameId = requestAnimationFrame(this.animate);
    }
  }

  /**
   * Animate the globe
   *
   * @memberof Globe
   */
  animate() {
    this.renderScene();
    this.frameId = window.requestAnimationFrame(this.animate);
  }

  /**
   * Renders the screen to the THREE's canvas
   *
   * @memberof Globe
   */
  renderScene() {
    this.controls.update();
    //the globe turns under a still mouse, so check the hover now and then
    this.frameCount = (this.frameCount || 0) + 1;
    if (this.mouseClient && this.frameCount % 10 === 0) this.updateHover();
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Component's Renderable JSX
   *
   * @returns {JSX} JSX
   * @memberof Globe
   */
  render() {
    return (
      <GlobeContainer>
        <div ref={(element) => (this.threeRootElement = element)} />
        {this.state.hover &&
          createPortal(<NodeInfo {...this.state.hover} />, document.body)}
      </GlobeContainer>
    );
  }
}

function NodeInfo({ x, y, point }) {
  const { params } = point;
  const style = { left: x + 14, top: y + 14 };
  if (params.type === 'SELF') {
    return (
      <NodeTooltip style={style}>
        <div><strong>{__('Your wallet')}</strong></div>
        {!!params.name && <div>{params.name}</div>}
      </NodeTooltip>
    );
  }
  const peers = params.peers || [];
  const versions = [...new Set(peers.map((peer) => peer.type).filter(Boolean))];
  const latencies = peers.map((peer) => peer.latency).filter((l) => l > 0 && l < 100000);
  const latency = latencies.length
    ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
    : null;
  return (
    <NodeTooltip style={style}>
      <div><strong>{params.name || __('Unknown location')}</strong></div>
      <div>
        {__('%{smart_count} node |||| %{smart_count} nodes', peers.length)}
        {' ('}
        {params.outgoing ? __('outgoing') : __('incoming')}
        {')'}
      </div>
      {versions.map((version) => (
        <div key={version} className="dim">{version}</div>
      ))}
      {latency !== null && (
        <div className="dim">{__('Latency %{ms} ms', { ms: latency })}</div>
      )}
    </NodeTooltip>
  );
}
