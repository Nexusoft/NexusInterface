import { Component } from 'react';
import * as THREE from 'three';
import styled from '@emotion/styled';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import world from 'icons/world-light-white.jpg';
import Curve from './Curve';
import Point from './Point';
import { callAPI } from 'lib/api';
import Color from 'color';
import { createPeerRefresh } from './peerRefresh';

__ = __context('Overview');

const MaxDisplayPoints = 64;

const GlobeContainer = styled.div({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  overflow: 'hidden',
});

const PeerError = styled.div({
  position: 'absolute',
  bottom: 20,
  left: 20,
  pointerEvents: 'none',
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
    this.pointRegistry = [];
    this.curveRegistry = [];
    this.state = { peerError: null };
    this.peerRefresh = createPeerRefresh({
      load: () => this.loadPeerLocations(),
      onSuccess: (peers) => {
        this.pointRegister(peers);
        this.setState({ peerError: null });
      },
      onError: (error) => {
        console.error('core.peer_list.failed', error);
        this.removeAllPoints();
        this.setState({ peerError: String(error?.message || error) });
      },
    });
  }

  /**
   * Mounting event from React, used to start the globe up
   *
   * @memberof Globe
   */
  componentDidMount() {
    try {
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
      if (this.props.coreAvailable) this.peerRefresh.start();

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
    if (this.props.globeColor != prevProps.globeColor) {
      const newColor = new THREE.Color(this.props.globeColor);
      this.globe.children[0].material.color = newColor; // [0] == globe
    }
    if (this.props.coreAvailable !== prevProps.coreAvailable) {
      if (this.props.coreAvailable) {
        this.peerRefresh.start();
      } else {
        this.peerRefresh.stop();
        this.removeAllPoints();
        this.setState({ peerError: null });
      }
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
    this.peerRefresh.stop();
    this.unmounted = true;
    this.stop();
    window.removeEventListener('resize', this.onWindowResize, false);
    this.controls?.dispose();
    if (this.renderer && this.threeRootElement?.children.length > 0) {
      this.threeRootElement.removeChild(this.renderer.domElement);
    }
  }

  /**
   * Register point/pillar on the globe
   *
   * @returns
   * @memberof Globe
   */
  async loadPeerLocations() {
    const peers = await callAPI('system/list/peers');
    if (
      !Array.isArray(peers) ||
      peers.some((peer) => typeof peer?.address !== 'string')
    ) {
      throw new Error('Invalid peer list returned by Core');
    }
    const peerInfo = peers.slice(0, MaxDisplayPoints);
    const addresses = peerInfo.map((peer) => peer.address.split(':')[0]);
    const geoLocations = addresses.length
      ? await window.nexusElectron.fileAssets.lookupGeoIp(addresses)
      : [];
    return { peerInfo, geoLocations };
  }

  pointRegister({ peerInfo, geoLocations }) {
    const signature = JSON.stringify([
      peerInfo.map(({ address, type, outgoing }) => [address, type, outgoing]),
      geoLocations,
      this.props.pillarColor,
      this.props.archColor,
    ]);
    if (signature === this.peerSignature) return;
    const geoDataByAddress = new Map(
      geoLocations
        .filter(Boolean)
        .map((location) => [location.address, location])
    );
    const points = new Map();
    peerInfo.forEach((peer) => {
      const location = geoDataByAddress.get(peer.address.split(':')[0]);
      if (!location) return;
      const key = JSON.stringify([location.latitude, location.longitude]);
      const existing = points.get(key);
      if (existing) {
        existing.params.peerConnections++;
      } else {
        points.set(key, {
          lat: location.latitude,
          lng: location.longitude,
          params: {
            type: peer.type,
            outgoing: peer.outgoing,
            name: location.timeZone,
            color: this.props.pillarColor,
            peerConnections: 1,
          },
        });
      }
    });
    this.removeAllPoints();
    points.forEach(({ lat, lng, params }) => {
      const point = new Point(lat, lng, params);
      this.allPoints.add(point.pillar);
      this.pointRegistry.push(point);
    });
    this.peerSignature = signature;
    this.arcRegister();
  }

  /**
   * Add globe to the renderer
   *
   * @memberof Globe
   */
  addSelfPoint() {
    let selfIndex = this.pointRegistry.findIndex(
      (point) => point.params.type === 'SELF'
    );

    if (selfIndex < 0 && !this.selfLookupPending) {
      this.selfLookupPending = true;
      window.nexusElectron.fileAssets
        .lookupPublicGeoIp()
        .then((data) => {
          if (this.unmounted) return;
          let self = new Point(data.latitude, data.longitude, {
            color: new Color(this.props.pillarColor).negate().hex(),
            name: data.timeZone,
            type: 'SELF',
            peerConnections: 1.5,
          });
          this.pointRegistry.push(self);
          this.allPoints.add(self.pillar);
          this.arcRegister();
        })
        .catch((e) => console.error(e))
        .finally(() => {
          this.selfLookupPending = false;
        });
    }
  }

  /**
   * Remove all points on the globe
   *
   * @memberof Globe
   */
  removeAllPoints() {
    this.peerSignature = undefined;
    this.pointRegistry.slice().forEach((point) => {
      if (point.params.type !== 'SELF') this.destroyPoint(point);
    });
  }

  /**
   * Remove point/pillar from the globe
   *
   * @param {*} deadPoint Point to remove
   * @memberof Globe
   */
  destroyPoint(deadPoint) {
    this.pointRegistry = this.pointRegistry.filter((point) => {
      if (point.pillar.uuid !== deadPoint.pillar.uuid) return point;
    });

    this.allPoints.remove(deadPoint.pillar);
    this.curveRegistry
      .filter((arc) => arc.pointOne === deadPoint || arc.pointTwo === deadPoint)
      .map((arc) => {
        this.destroyArc(arc);
      });

    deadPoint.pillar.geometry.dispose();
    deadPoint.pillar.material.dispose();
    deadPoint.pillar = undefined;
  }

  /**
   * Register a arc with the globe
   *
   * @memberof Globe
   */
  arcRegister() {
    let self =
      this.pointRegistry[
        this.pointRegistry.findIndex((element) => {
          return element.params.type === 'SELF';
        })
      ];

    if (self) {
      this.pointRegistry.forEach((point) => {
        let existIndex = this.curveRegistry.findIndex((curve) => {
          if (
            curve.pointOne.lat === point.lat &&
            curve.pointOne.lng === point.lng &&
            curve.pointTwo.lat === self.lat &&
            curve.pointTwo.lng === self.lng
          ) {
            return curve;
          } else return false;
        });

        if (
          (point.lat === self.lat && point.lng === self.lng) ||
          existIndex >= 0
        ) {
          return;
        } else {
          let temp = new Curve(point, self, {
            color: this.props.archColor,
            forward: point.params.outgoing,
          });
          this.allArcs.add(temp.arc);
          temp.play();
          this.curveRegistry.push(temp);
        }
      });
    } else {
      this.addSelfPoint();
    }
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
        {this.state.peerError && (
          <PeerError>
            {__('Peer locations unavailable')}: {this.state.peerError}
          </PeerError>
        )}
      </GlobeContainer>
    );
  }
}
