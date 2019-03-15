import React, { Component } from 'react';
import * as THREE from 'three';
import world from 'images/world-light-white.jpg';
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
    this.onMouseWheel = this.onMouseWheel.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.startDragPosition = { x: 0, y: 0 };
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

    //set background color to transparent
    renderer.setClearColor(0x000000, 0);

    //set the renderer size
    renderer.setSize(WIDTH, HEIGHT);

    //set the camera position - x, y, z
    camera.position.set(0, 0, 500);

    //add the camera to the scene.
    scene.add(camera);

    const globe = new THREE.Group();
    //add it to the scene
    scene.add(globe);

    // instantiate a loader
    var loader = new THREE.TextureLoader();
    loader.load(world, function(texture) {
      //create the sphere
      var sphere = new THREE.SphereGeometry(200, 50, 50);

      //map the texture to the material. Read more about materials in three.js docs
      var material = new THREE.MeshBasicMaterial({
        map: texture,
      });

      //create a new mesh with sphere geometry.
      var mesh = new THREE.Mesh(sphere, material);

      //add mesh to globe group
      globe.add(mesh);
    });

    // Move the sphere back (z) so we can see it.
    globe.position.z = -300;
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

    // Attach the renderer to the DOM element.
    this.threeRootElement.appendChild(renderer.domElement);
    this.threeRootElement.addEventListener(
      'mousedown',
      this.onMouseDown,
      false
    );
    window.addEventListener('resize', this.onWindowResize, false);
    this.threeRootElement.addEventListener(
      'mousewheel',
      this.onMouseWheel,
      false
    );
    this.start();
  }

  onMouseDown(event) {
    event.preventDefault();

    this.threeRootElement.addEventListener(
      'mousemove',
      this.onMouseMove,
      false
    );
    this.threeRootElement.addEventListener('mouseup', this.onMouseUp, false);
    this.threeRootElement.addEventListener('mouseout', this.onMouseUp, false);
    this.startDragPosition = { x: event.clientX, y: event.clientY };
    this.threeRootElement.style.cursor = 'move';
  }

  onMouseMove(event) {
    // this.globe.rotation.y = 0;
    // let targetRotationX =
    //   (event.clientX - this.startDragPosition.x + window.innerWidth / 2) *
    //   0.0025 *
    //   (Math.PI / 180);
    // this.globe.rotateX(targetRotationX);
    let targetRotationY =
      (event.clientY - this.startDragPosition.y + window.innerHeight / 2) *
      0.0025 *
      (Math.PI / 180);

    this.globe.rotateY(targetRotationY);

    // this.globe.rotation.y += 0.002;
  }

  onMouseUp(event) {
    this.threeRootElement.removeEventListener(
      'mousemove',
      this.onMouseMove,
      false
    );
    this.threeRootElement.removeEventListener('mouseup', this.onMouseUp, false);
    this.threeRootElement.removeEventListener(
      'mouseout',
      this.onMouseUp,
      false
    );
    this.threeRootElement.style.cursor = 'auto';
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

  onMouseWheel(event) {
    event.preventDefault();
    let delta = event.wheelDeltaY * 0.3;
    if (this.globe.position.z > -300 && delta > 0) {
      this.globe.position.z -= delta;
    } else if (this.globe.position.z < 130 && delta < 0) {
      this.globe.position.z -= delta;
    } else {
      return;
    }
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
    this.globe.rotation.y += 0.002;
    this.renderScene();
    this.frameId = window.requestAnimationFrame(this.animate);
  }

  renderScene() {
    if (this.globe.rotation.y < 0) {
      console.log(this.globe.rotation.y);
    } else console.log('y', this.globe.rotation.y);
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
