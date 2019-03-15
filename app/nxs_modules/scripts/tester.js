import React, { Component } from 'react';
import * as THREE from 'three';
import world from 'images/world-light-white.jpg';
var OrbitControls = require('three-orbit-controls')(THREE);
import worldSmall from 'images/world-light-white-small.jpg';
import { geoInterpolate } from 'd3-geo';
import styled from '@emotion/styled';
const GlobeContainer = styled.div({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  overflow: 'hidden',
});
export default class Globe extends Component {
  constructor() {
    super();
    this.threeRootElement = null;
    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
    this.animate = this.animate.bind(this);
    this.onWindowResize = this.onWindowResize.bind(this);
    // this.onMouseWheel = this.onMouseWheel.bind(this);
    // this.onMouseDown = this.onMouseDown.bind(this);
    // this.onMouseUp = this.onMouseUp.bind(this);
    // this.onMouseMove = this.onMouseMove.bind(this);
    // this.startDragPosition = { x: 0, y: 0 };
  }

  componentDidMount() {
    const WIDTH = window.innerWidth;
    const HEIGHT = window.innerHeight;
    const VIEW_ANGLE = 45;
    const ASPECT = WIDTH / HEIGHT;
    const NEAR = 0.1;
    const FAR = 10000;

    //create a WebGL renderer, camera, and scene
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    const camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
    const scene = new THREE.Scene();
    const controls = new OrbitControls(camera);

    renderer.setClearColor(0x000000, 0);
    renderer.setSize(WIDTH, HEIGHT);

    camera.position.set(0, 0, 500);
    controls.autoRotate = true;
    controls.minDistance = 300;
    controls.maxDistance = 500;
    controls.update();
    scene.add(camera);

    const globe = new THREE.Group();
    scene.add(globe);

    var loader = new THREE.TextureLoader();
    loader.load(world, function(texture) {
      var sphere = new THREE.SphereGeometry(125, 50, 50);
      var material = new THREE.MeshBasicMaterial({
        map: texture,
      });
      var mesh = new THREE.Mesh(sphere, material);
      globe.add(mesh);
    });

    console.log(globe);
    //Lighting

    //create a point light (won't make a difference here because our material isn't affected by light)
    // const pointLight = new THREE.PointLight(0xffffff);

    // //set its position
    // pointLight.position.x = 10;
    // pointLight.position.y = 50;
    // pointLight.position.z = 400;

    // //add light to the scene
    // scene.add(pointLight);

    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.globe = globe;
    this.controls = controls;
    // Attach the renderer to the DOM element.
    this.threeRootElement.appendChild(renderer.domElement);
    window.addEventListener('resize', this.onWindowResize, false);
    this.start();
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  componentWillUnmount() {
    this.stop();
    this.threeRootElement.removeChild(this.renderer.domElement);
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
    return (
      <GlobeContainer>
        <div ref={element => (this.threeRootElement = element)} />
      </GlobeContainer>
    );
  }
}
