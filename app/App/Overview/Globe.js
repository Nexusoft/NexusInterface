import React, { Component } from 'react';
import * as THREE from 'three';
import maxmind from 'maxmind';
import path from 'path';
import styled from '@emotion/styled';
const OrbitControls = require('three-orbit-controls')(THREE);

import world from 'images/world-light-white.jpg';
import worldSmall from 'images/world-light-white-small.jpg';
import * as RPC from 'scripts/rpc';
import configuration from 'api/configuration';
import Curve from './Curve';
import Point from './Point';

const GlobeContainer = styled.div({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  overflow: 'hidden',
});

const Shader = {
  uniforms: {
    texture: { type: 't', value: null },
  },
  vertexShader: [
    'varying vec3 vNormal;',
    'varying vec2 vUv;',
    'void main() {',
    'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
    'vNormal = normalize( normalMatrix * normal );',
    'vUv = uv;',
    '}',
  ].join('\n'),
  fragmentShader: [
    'uniform sampler2D _texture;',
    'uniform vec4 colorMod;',
    'varying vec3 vNormal;',
    'varying vec2 vUv;',
    'void main() {',
    'vec3 diffuse = texture2D( _texture, vUv ).xyz;',
    'float intensity = 1.05 - vNormal.z ;',
    'vec3 atmosphere = vec3( 1.0, 1.0, 1.0 ) * pow( intensity, 3.0 );',
    'gl_FragColor = vec4( (diffuse*colorMod.xyz) + atmosphere, 1.0 );',
    '}',
  ].join('\n'),
};

export default class Globe extends Component {
  constructor() {
    super();
    this.threeRootElement = null;
    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
    this.animate = this.animate.bind(this);
    this.onWindowResize = this.onWindowResize.bind(this);
    // this.createPoint = this.createPoint.bind(this);
    this.pointController = this.pointController.bind(this);
    this.geoiplookup = null;
    this.pointRegistry = [];
    this.timesSkipped = 0;
  }

  componentDidMount() {
    if (process.env.NODE_ENV === 'development') {
      this.geoiplookup = maxmind.openSync(
        path.join(__dirname, 'GeoLite2-City', 'GeoLite2-City.mmdb')
      );
    } else {
      this.geoiplookup = maxmind.openSync(
        path.join(
          configuration.GetAppResourceDir(),
          'GeoLite2-City',
          'GeoLite2-City.mmdb'
        )
      );
    }
    this.props.handleOnLineRender(this.arcRender);
    this.props.handleRemoveAllPoints(this.removeAllPoints);
    // this.props.handleOnAddData(this.pointController);
    const WIDTH = window.innerWidth;
    const HEIGHT = window.innerHeight;
    const VIEW_ANGLE = 45;
    const ASPECT = WIDTH / HEIGHT;
    const NEAR = 0.1;
    const FAR = 10000;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    const camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
    const scene = new THREE.Scene();

    const controls = new OrbitControls(camera);
    const globe = new THREE.Group();
    const sphere = new THREE.SphereGeometry(125, 50, 50);
    const allPoints = new THREE.Group();
    const allArcs = new THREE.Group();

    renderer.setClearColor(0x000000, 0);
    renderer.setSize(WIDTH, HEIGHT);
    camera.position.set(0, 235, 500);
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.8;
    controls.minDistance = 300;
    controls.maxDistance = 500;
    controls.enablePan = false;
    controls.update();
    scene.add(camera);

    const uniforms = THREE.UniformsUtils.clone(Shader.uniforms);
    const colormoddd = new THREE.Color(this.props.globeColor);
    const globeR = colormoddd.r / 1;
    const globeG = colormoddd.g / 1;
    const globeB = colormoddd.b / 1;

    uniforms['_texture'] = {
      type: 't',
      value: new THREE.TextureLoader().load(world),
    };
    uniforms['colorMod'] = {
      type: 'v4',
      value: new THREE.Vector4(globeR, globeG, globeB, 1.0),
    };

    const shadedMap = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: Shader.vertexShader,
      fragmentShader: Shader.fragmentShader,
    });
    const mesh = new THREE.Mesh(sphere, shadedMap);

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
    fetch('http://www.geoplugin.net/json.gp')
      .then(response => response.json())
      .then(data => {
        let self = new Point(
          parseFloat(data.geoplugin_latitude),
          parseFloat(data.geoplugin_longitude),
          {
            color: '#44EB08',
            name: data.geoplugin_timezone,
            type: 'SELF',
          }
        );
        this.pointRegistry.push(self);
        this.allPoints.add(self.pillar);
      })
      .catch(e => console.log(e));

    this.threeRootElement.appendChild(renderer.domElement);
    window.addEventListener('resize', this.onWindowResize, false);
    this.start();

    // setTimeout(() => {
    //   this.removeAllPoints();
    // }, 20000);
  }

  componentDidUpdate(prevProps) {
    this.timesSkipped++;
    if (
      this.props.connections !== prevProps.connections ||
      this.timesSkipped > 15
    ) {
      this.pointController();
      this.timesSkipped = 0;
    }
  }

  componentWillUnmount() {
    this.stop();
    this.threeRootElement.removeChild(this.renderer.domElement);
  }

  async pointController() {
    const peerInfo = await RPC.PROMISE('getpeerinfo', []);

    // take the peerInfo look up the Geo Data in the maxmind DB
    // and if there are any points that exist and match coords
    // update the registery entry data
    let newPoints = peerInfo
      .map(peer => {
        let GeoData = this.geoiplookup.get(peer.addr.split(':')[0]);
        // TODO: add checks for lisp and change color appropreately
        return {
          lat: GeoData.location.latitude,
          lng: GeoData.location.longitude,
          params: {
            type: peer.type,
            name: GeoData.location.time_zone,
            color: this.props.pillarColor,
          },
        };
      })
      .filter(peer => {
        let existIndex = this.pointRegistry.findIndex(
          point => peer.lat === point.lat && peer.lng === point.lng
        );

        if (existIndex >= 0) {
          this.pointRegistry[existIndex] = {
            ...this.pointRegistry[existIndex],
            type: peer.type,
          };
        } else {
          return peer;
        }
      });

    // filter out any points that exist in the new points array except self
    this.pointRegistry = this.pointRegistry.filter(point => {
      let existIndex = newPoints.findIndex(
        peer => peer.lat === point.lat && peer.lng === point.lng
      );

      if (existIndex <= 0 || point.params.type === 'SELF') {
        return point;
      } else {
        this.destroyPoint(point.pillar);
      }
    });

    newPoints.map(peer => {
      let point = new Point(peer.lat, peer.lng, peer.params);
      this.pointRegistry.push(point);
      this.allPoints.add(point.pillar);
    });

    console.log(newPoints, this.pointRegistry);
  }

  removeAllPoints() {
    this.pointRegistry.map(point => {
      if (point.params.type === 'SELF') {
        setTimeout(() => {
          this.destroyPoint(point.pillar);
        }, 11000);
      } else {
        setTimeout(() => {
          this.destroyPoint(point.pillar);
        }, Math.random() * 10000);
      }
    });
    this.pointRegistry = [];
  }

  destroyPoint(deadPoint) {
    console.log(deadPoint, this.allPoints);
    this.allPoints.remove(deadPoint);
    deadPoint.geometry.dispose();
    deadPoint.material.dispose();
    deadPoint = undefined;
  }
  //////////////////////////////////////////////////////////

  //////////////////////////////////////////////////////////
  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  stop() {
    cancelAnimationFrame(this.frameId);
  }

  start() {
    if (!this.frameId) {
      this.frameId = requestAnimationFrame(this.animate);
    }
  }

  animate() {
    this.renderScene();
    this.frameId = window.requestAnimationFrame(this.animate);
  }

  renderScene() {
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  render() {
    if (this.pointRegistry.length > 2) {
      // console.log(this.pointRegistry, this.allPoints);
      // console.log(
      //   new Point(this.pointRegistry[0].lat, this.pointRegistry[0].lng, {
      //     color: this.props.pillarColor,
      //     name: 'booya',
      //   })
      // );
    }

    return (
      <GlobeContainer>
        <div ref={element => (this.threeRootElement = element)} />
      </GlobeContainer>
    );
  }
}
