import { Component } from 'react';
import { isIP } from 'net';
import * as THREE from 'three';
import { mapX } from './mapProjection';
import styled from '@emotion/styled';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import world from 'icons/world-light-white.jpg';
import geoip from 'data/geoip';
import Curve from './Curve';
import Point from './Point';
import createPeerMapMaterial from './PeerMapMaterial';
import { callAPI } from 'lib/api';
import store from 'store';
import Color from 'color';
import themeStyles from 'utils/themeStyles';

const MaxDisplayPoints = 64;

// Accept IPv4, bare IPv6 and bracketed IPv6 endpoints without truncating IPv6.
function peerIP(address) {
  if (typeof address !== 'string') return '';
  if (address.startsWith('[')) return address.slice(1, address.indexOf(']'));
  return isIP(address) ? address : address.split(':')[0];
}
let peerSnapshot = null;
let selfLocation = null;
let selfLocationRequest = null;

const peerCacheKey = () => {
  const { settings, core: { config, systemInfo } } = store.getState();
  return JSON.stringify(settings.manualDaemon
    ? [true, settings.manualDaemonIP, settings.manualDaemonApiSSL,
      settings.manualDaemonApiPort, settings.manualDaemonApiPortSSL, systemInfo?.testnet]
    : [false, config?.ip, config?.apiSSL, config?.apiPort, config?.apiPortSSL, systemInfo?.testnet]);
};

const GlobeContainer = styled.div(themeStyles([{
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  overflow: 'hidden'
}], [{
  position: 'absolute',
  inset: 0,
  overflow: 'hidden',
  '& > div': {
    width: '100%',
    height: '100%'
  },
  '& canvas': {
    display: 'block',
    width: '100%',
    height: '100%'
  }
}]));

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
    this.peerAddresses = null;
    this.peerPulses = [];
  }

  /**
   * Mounting event from React, used to start the globe up
   *
   * @memberof Globe
   */
  componentDidMount() {
    this.unmounted = false;
    try {
      this.props.handleOnLineRender(this.animateArcs);
      this.props.handleRemoveAllPoints(this.removeAllPoints);

      const WIDTH = this.props.modern ? this.threeRootElement.clientWidth : window.innerWidth;
      const HEIGHT = this.props.modern ? this.threeRootElement.clientHeight : window.innerHeight;
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
      const sphere = this.props.mapLayout
        ? new THREE.PlaneGeometry(720, 360, 72, 36)
        : new THREE.SphereGeometry(125, 50, 50);
      const allPoints = new THREE.Group();
      const allArcs = new THREE.Group();
      allArcs.visible = !this.props.modern;

      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(WIDTH, HEIGHT, !this.props.modern);
      camera.position.set(0, 235, 500);
      controls.autoRotate = !this.props.mapLayout;
      if (this.props.mapLayout) {
        controls.minPolarAngle = 0.1;
        controls.maxPolarAngle = Math.PI / 2.5;
      }
      controls.autoRotateSpeed = 0.8;
      controls.enableDamping = true;
      controls.dampingFactor = 0.25;
      controls.minDistance = 300;
      controls.maxDistance = this.props.modern ? 1200 : 500;
      controls.enableZoom = !this.props.modern && !this.props.mapLayout;
      if (this.props.mapLayout) controls.minDistance = 100;
      controls.enablePan = false;
      controls.enableRotate = !this.props.mapLayout;
      // Disabled by default, fixing a bug where the LoginModal input cannot get focused
      controls.enabled = false;
      controls.update();
      scene.add(camera);

      const importworld = new THREE.TextureLoader().load(world, (texture) => {
        if (this.unmounted) {
          texture.dispose();
          return;
        }
        mesh.visible = true;
      });
      importworld.anisotropy = 4;
      const newWorld = this.props.mapLayout ? createPeerMapMaterial(importworld, this.props.mapColor || this.props.globeColor, this.props.mapGlowColor || this.props.archColor) : new THREE.MeshBasicMaterial({
        map: importworld,
        transparent: true,
        opacity: Color(this.props.globeColor).alpha(),
        depthWrite: Color(this.props.globeColor).alpha() === 1,
        color: Color(this.props.globeColor).hex(),
      });

      const mesh = new THREE.Mesh(sphere, newWorld);
      // An unloaded sampler is black, which the map shader interprets as land.
      // Keep the plane transparent until the geographic texture is available.
      mesh.visible = !this.props.mapLayout;

      if (this.props.mapLayout) mesh.rotation.x = -Math.PI / 2;
      globe.add(mesh);
      const grid = new THREE.Mesh(
        this.props.mapLayout ? new THREE.PlaneGeometry(720, 360, 36, 18) : new THREE.SphereGeometry(126, 36, 18),
        new THREE.MeshBasicMaterial({
          color: Color(this.props.globeColor).hex(),
          wireframe: true,
          transparent: true,
          opacity: 0.12 * Color(this.props.globeColor).alpha(),
          depthWrite: false,
        })
      );
      if (this.props.mapLayout) { grid.rotation.x = -Math.PI / 2; grid.position.y = 0.2; }
      if (this.props.modern && !this.props.mapLayout) { globe.add(grid); this.globeGrid = grid; }
      else { grid.geometry.dispose(); grid.material.dispose(); }
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
      if (peerSnapshot?.key === peerCacheKey() &&
          Date.now() - peerSnapshot.updatedAt < 60000 && this.props.connections > 0) {
        this.registerPeers(peerSnapshot.peers);
      }
      this.pointRegister();
      if (this.props.mapLayout) {
        this.peerRefreshTimer = setInterval(this.pointRegister, 10000);
      }

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
          this.controls.enabled = !this.props.mapLayout;
        },
        false
      );
      this.threeRootElement.appendChild(renderer.domElement);
      window.addEventListener('resize', this.onWindowResize, false);
      this.resizeObserver = new ResizeObserver(this.onWindowResize);
      this.resizeObserver.observe(this.threeRootElement);
      this.resizeGlobe();
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
    if (this.allArcs) this.allArcs.visible = !this.props.modern;
    if (geoip == null) {
      return;
    }
    if (this.props.mapLayout && this.globe) {
      const uniforms = this.globe.children[0].material.uniforms;
      const land = Color(this.props.mapColor || this.props.globeColor);
      const glow = Color(this.props.mapGlowColor || this.props.archColor);
      uniforms.landColor.value.set(land.hex());
      uniforms.landOpacity.value = land.alpha();
      uniforms.glowOpacity.value = glow.alpha();
      uniforms.glowColor.value.set(glow.hex());
    }
    if (this.globe) {
      this.pointRegistry.forEach((point) => point.setColor(point.params.type === 'SELF'
        ? new Color(this.props.pillarColor).negate().rgb().string() : this.props.pillarColor));
      this.curveRegistry.forEach((curve) => {
        curve.arc.material.color.set(Color(this.props.archColor).hex());
        curve.arc.material.opacity = 0.6 * Color(this.props.archColor).alpha();
      });
      this.peerPulses.forEach(({ mesh }) => mesh.children.forEach((ring) => ring.material.color.set(Color(this.props.pillarColor).hex())));
    }
    if (this.globe && !this.props.mapLayout && this.props.globeColor != prevProps.globeColor) {
      const color = Color(this.props.globeColor);
      const material = this.globe.children[0].material;
      material.color.set(color.hex());
      material.opacity = color.alpha();
      material.depthWrite = color.alpha() === 1;
      if (this.globeGrid) {
        this.globeGrid.material.color.set(color.hex());
        this.globeGrid.material.opacity = 0.12 * color.alpha();
      }
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
    this.unmounted = true;
    clearTimeout(this.peerRetryTimer);
    clearInterval(this.peerRefreshTimer);
    this.stop();
    cancelAnimationFrame(this.resizeFrame);
    window.removeEventListener('resize', this.onWindowResize, false);
    this.resizeObserver?.disconnect();
    this.controls?.dispose();
    this.scene?.traverse((object) => {
      object.geometry?.dispose();
      if (object.material) {
        object.material.map?.dispose();
        object.material.dispose();
      }
    });
    this.renderer?.dispose();
    if (this.renderer && this.threeRootElement?.contains(this.renderer.domElement)) {
      this.threeRootElement.removeChild(this.renderer.domElement);
    }
  }

  /**
   * Register point/pillar on the globe
   *
   * @returns
   * @memberof Globe
   */
  async pointRegister() {
    clearTimeout(this.peerRetryTimer);
    if (this.unmounted || this.peerRequestPending) return;
    this.peerRequestPending = true;
    const key = peerCacheKey();
    let peerInfo;
    try {
      peerInfo = await callAPI('system/list/peers', null);
    } catch (error) {
      // The Core API may not be listening yet while the wallet starts.
      // Keep the globe visible and retry instead of rejecting an unawaited call.
      if (!this.unmounted) {
        console.warn('Globe peer lookup failed; retrying in 3 seconds', error);
        clearTimeout(this.peerRetryTimer);
        this.peerRetryTimer = setTimeout(this.pointRegister, 3000);
      }
      return;
    } finally {
      this.peerRequestPending = false;
    }
    if (key !== peerCacheKey()) return;
    if (Array.isArray(peerInfo)) {
      peerSnapshot = { key, peers: peerInfo.slice(0, MaxDisplayPoints), updatedAt: Date.now() };
    }
    if (this.unmounted) return;
    clearTimeout(this.peerRetryTimer);
    if (!Array.isArray(peerInfo)) return;
    this.registerPeers(peerInfo.slice(0, MaxDisplayPoints));
  }

  registerPeers(peerInfo) {

    //console.error(peerInfo);

    const peerAddresses = new Set(peerInfo.map((peer) => peer.address));
    const pulseLocations = new Set();
    peerInfo.forEach((peer) => {
      // A newly mounted overview establishes a baseline without replaying arrivals.
      if (!this.peerAddresses || this.peerAddresses.has(peer.address)) return;
      const location = geoip.get(peerIP(peer.address))?.location;
      if (!location || !Number.isFinite(location.latitude) ||
          !Number.isFinite(location.longitude)) return;
      const key = `${location.latitude},${location.longitude}`;
      if (pulseLocations.has(key)) return;
      pulseLocations.add(key);
      this.addPeerPulse(location.latitude, location.longitude);
    });
    this.peerAddresses = peerAddresses;

    // take the peerInfo look up the Geo Data in the maxmind DB
    // and if there are any points that exist and match coords
    // update the registry entry data

    let newRegistry = peerInfo
      .map((peer) => {
        let GeoData = geoip.get(peerIP(peer.address));
        // TODO: add checks for lisp and change color appropreately
        //console.log(this.props.pillarColor);
        if (!GeoData || !Number.isFinite(GeoData.location?.latitude) ||
            !Number.isFinite(GeoData.location?.longitude)) return null;
        return {
          lat: GeoData.location.latitude,
          lng: GeoData.location.longitude,
          params: {
            type: peer.type,
            outgoing: peer.outgoing,
            name: GeoData.location.time_zone,
            color: this.props.pillarColor,
            peerConnections: 1,
          },
        };
      })
      .filter(Boolean)
      .map((peer, i, array) => {
        ///Find out how many peers will be on pillar
        let duplicateIndex = array
          .map(
            (internalPoint) =>
              peer.lat === internalPoint.lat && peer.lng === internalPoint.lng
          )
          .filter((e) => e);

        return {
          ...peer,
          params: {
            ...peer.params,
            peerConnections: 1 + duplicateIndex.length,
          },
        };
      })
      .map((peer, i, array) => {
        let existIndex = this.pointRegistry.findIndex(
          (point) => peer.lat === point.lat && peer.lng === point.lng
        );
        let duplicateIndex = array.findIndex(
          (internalPoint) =>
            peer.lat === internalPoint.lat && peer.lng === internalPoint.lng
        );

        // if not an internal duplicate and already exists
        if (existIndex >= 0 && duplicateIndex === i) {
          return this.pointRegistry[existIndex];
        } else if (duplicateIndex === i) {
          let newPoint = new Point(peer.lat, peer.lng, { ...peer.params, mapLayout: this.props.mapLayout });
          this.allPoints.add(newPoint.pillar);
          return newPoint;
        }
      })
      .filter((e) => e);

    this.pointRegistry.map((point) => {
      let existIndex = newRegistry.findIndex(
        (peer) => peer.lat === point.lat && peer.lng === point.lng
      );

      if (existIndex < 0 && point.params.type !== 'SELF') {
        this.destroyPoint(point);
      }
    });
    //console.error(newRegistry);
    this.pointRegistry = [
      ...this.pointRegistry.filter((point) => point.params.type === 'SELF' && !newRegistry.includes(point)),
      ...newRegistry,
    ];
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

    if (selfIndex < 0 && !this.selfPointPending && !this.unmounted) {
      this.selfPointPending = true;
      if (!selfLocation && !selfLocationRequest) {
        selfLocationRequest = fetch('http://www.geoplugin.net/json.gp')
          .then((response) => response.json())
          .then((data) => {
            if (!Number.isFinite(parseFloat(data.geoplugin_latitude)) ||
                !Number.isFinite(parseFloat(data.geoplugin_longitude))) {
              throw new Error('Self location unavailable');
            }
            selfLocation = data;
            return data;
          })
          .finally(() => { selfLocationRequest = null; });
      }
      Promise.resolve(selfLocation || selfLocationRequest)
        .then((data) => {
          if (this.unmounted) return;
          let self = new Point(
            parseFloat(data.geoplugin_latitude),
            parseFloat(data.geoplugin_longitude),
            {
              color: new Color(this.props.pillarColor).negate().rgb().string(),
              name: data.geoplugin_timezone,
              type: 'SELF',
              mapLayout: this.props.mapLayout,
              peerConnections: 1.5,
            }
          );
          this.pointRegistry.push(self);
          this.allPoints.add(self.pillar);
          this.arcRegister();
        })
        .catch((e) => console.error(e))
        .finally(() => { this.selfPointPending = false; });
    }
  }

  addPeerPulse(lat, lng) {
    const phi = THREE.MathUtils.degToRad(90 - lat);
    const theta = THREE.MathUtils.degToRad(-lng);
    const pulse = new THREE.Group();
    pulse.position.set(
      127 * Math.sin(phi) * Math.cos(theta),
      127 * Math.cos(phi),
      127 * Math.sin(phi) * Math.sin(theta)
    );
    pulse.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 0, 1), pulse.position.clone().normalize()
    );
    if (this.props.mapLayout) {
      pulse.position.set(mapX(lng), 2, -lat * 2);
      pulse.rotation.set(-Math.PI / 2, 0, 0);
    }
    for (let i = 0; i < 2; i += 1) {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.75, 1, 64),
        new THREE.MeshBasicMaterial({
          color: Color(this.props.pillarColor).hex(),
          transparent: true,
          opacity: 0,
          side: THREE.DoubleSide,
          depthWrite: false,
        })
      );
      // The map and rings are transparent. Explicit ordering prevents the
      // map's fill from being blended over a ring as the camera moves.
      if (this.props.mapLayout) ring.renderOrder = 1;
      pulse.add(ring);
    }
    this.globe.add(pulse);
    this.peerPulses.push({ mesh: pulse, startedAt: performance.now() });
  }

  animatePeerPulses(now) {
    this.peerPulses = this.peerPulses.filter(({ mesh, startedAt }) => {
      const elapsed = now - startedAt;
      if (elapsed >= 5000) {
        this.globe.remove(mesh);
        mesh.children.forEach((ring) => {
          ring.geometry.dispose();
          ring.material.dispose();
        });
        return false;
      }
      mesh.children.forEach((ring, index) => {
        const progress = ((elapsed + index * 600) % 1200) / 1200;
        ring.scale.setScalar(2 + progress * 13);
        ring.material.opacity = Color(this.props.pillarColor).alpha() * (1 - progress) * Math.min(1, (5000 - elapsed) / 600);
      });
      return true;
    });
  }

  /**
   * Remove all points on the globe
   *
   * @memberof Globe
   */
  removeAllPoints() {
    this.pointRegistry.map((point) => {
      if (point.params.type === 'SELF') {
        setTimeout(() => {
          //this.destroyPoint(point);
        }, 11000);
      } else {
        setTimeout(() => {
          this.destroyPoint(point);
        }, Math.random() * 10000);
      }
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
      .filter((arc) => {
        if (
          (arc.pointOne.lat === deadPoint.lat &&
            arc.pointOne.lat === deadPoint.lat) ||
          (arc.pointTwo.lat === deadPoint.lat &&
            arc.pointTwo.lat === deadPoint.lat)
        )
          return arc;
      })
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
    if (this.props.modern) return;
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
    if (this.props.modern) return;
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
    if (this.resizeFrame != null) return;
    this.resizeFrame = requestAnimationFrame(() => {
      this.resizeFrame = null;
      this.resizeGlobe();
    });
  }

  resizeGlobe() {
    if (!this.camera || !this.renderer || !this.threeRootElement) return;
    if (!this.props.modern) {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      return;
    }
    const width = this.threeRootElement.clientWidth;
    const height = this.threeRootElement.clientHeight;
    if (!width || !height) return;
    if (width === this.lastWidth && height === this.lastHeight) return;
    this.lastWidth = width;
    this.lastHeight = height;
    this.camera.aspect = width / height;
    if (this.props.mapLayout) {
      // Fit the visible map (-60 to 90 latitude), rather than the empty
      // Antarctic region. The steeper view gives continents more screen height.
      const tanFov = Math.tan(this.camera.fov * Math.PI / 360);
      const elevation = 0.97;
      const depth = Math.sqrt(1 - elevation * elevation);
      let distance = (Math.max(360 / (tanFov * this.camera.aspect),
        150 * elevation / tanFov) + 150 * depth) / 0.95;
      this.camera.updateProjectionMatrix();
      // Fit the projected visible bounds, including perspective, to the actual
      // container. Recompute on every container resize, leaving a 5% margin.
      for (let iteration = 0; iteration < 8; iteration += 1) {
        const centerZ = -30 + (2 * depth * 150 * 150) /
          (Math.sqrt(distance * distance + 4 * depth * depth * 150 * 150) + distance);
        this.controls.target.set(0, 0, centerZ);
        this.camera.position.set(0, distance * elevation, centerZ + distance * depth);
        this.camera.lookAt(0, 0, centerZ);
        this.camera.updateMatrixWorld();
        let extent = 0;
        for (const x of [-360, 360]) {
          for (const z of [-180, 120]) {
            const point = new THREE.Vector3(x, 0, z).project(this.camera);
            extent = Math.max(extent, Math.abs(point.x), Math.abs(point.y));
          }
        }
        if (iteration < 7) distance *= extent / 0.95;
      }
      this.controls.maxDistance = distance;
      this.renderer.setSize(width, height, false);
      return;
    }
    // Fit the entire atmosphere, leaving room for the caption below it.
    const halfFov = (this.camera.fov * Math.PI) / 360;
    const atmosphereRadius = Math.min(width, Math.max(1, height - 80)) * 0.48;
    const radius = atmosphereRadius / 1.15;
    const cameraDistance = 125 * Math.sqrt(
      1 + (height / (2 * Math.tan(halfFov) * radius)) ** 2
    );
    const distance = cameraDistance / Math.sqrt(1 + 0.25 ** 2);
    this.camera.position.set(0, distance * 0.25, distance);
    this.controls.maxDistance = cameraDistance;
    // Center the sphere on the same vertical midpoint as the metric columns.
    this.camera.setViewOffset(width, height, 0, 0, width, height);
    this.threeRootElement.closest('[data-globe-stage]')?.style.setProperty(
      '--globe-diameter', `${radius * 2}px`
    );
    this.camera.updateProjectionMatrix();
    // CSS controls the canvas layout; only resize its drawing buffer here.
    this.renderer.setSize(width, height, false);
  }

  /**
   * Stop the animation
   *
   * @memberof Globe
   */
  stop() {
    cancelAnimationFrame(this.frameId);
    this.frameId = null;
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
    this.animatePeerPulses(performance.now());
    this.renderScene();
    this.frameId = window.requestAnimationFrame(this.animate);
  }

  /**
   * Renders the screen to the THREE's canvas
   *
   * @memberof Globe
   */
  renderScene() {
    // Layout can change when async dashboard content arrives. Fit before
    // drawing so a frame never uses the previous container's camera sizing.
    if (this.props.modern) this.resizeGlobe();
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
      </GlobeContainer>
    );
  }
}
