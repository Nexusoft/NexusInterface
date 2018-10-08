/**
 * dat.globe Javascript WebGL Globe Toolkit
 * https://github.com/dataarts/webgl-globe
 *
 * Copyright 2011 Data Arts Team, Google Creative Lab
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import * as THREE from "three";
import world from "../images/Map.jpg";

import { geoInterpolate } from "d3-geo";
var DAT = DAT || {};

var CurveMeshs;
var PillarMeshs;

export default (DAT.Globe = function(container, opts) {
  opts = opts || {};

  var colorFn =
    opts.colorFn ||
    function(x) {
      var c = new THREE.Color();
      c.setHSL(0.6 - x * 0.5, 1.0, 0.5); // Controls the vertical line colors
      return c;
    };
  var colorArch = opts.colorArch || 0x00ffff;
  var imgDir = opts.imgDir || "images/";

  var Shaders = {
    earth: {
      uniforms: {
        texture: { type: "t", value: null }
      },
      vertexShader: [
        "varying vec3 vNormal;",
        "varying vec2 vUv;",
        "void main() {",
        "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
        "vNormal = normalize( normalMatrix * normal );",
        "vUv = uv;",
        "}"
      ].join("\n"),
      fragmentShader: [
        "uniform sampler2D texture;",
        "varying vec3 vNormal;",
        "varying vec2 vUv;",
        "void main() {",
        "vec3 diffuse = texture2D( texture, vUv ).xyz;",
        "float intensity = 1.05 - dot( vNormal, vec3( 0.0, 0.0, 1.0 ) );",
        "vec3 atmosphere = vec3( 1.0, 1.0, 1.0 ) * pow( intensity, 3.0 );",
        "gl_FragColor = vec4( diffuse + atmosphere, 1.0 );",
        "}"
      ].join("\n")
    },
    atmosphere: {
      uniforms: {},
      vertexShader: [
        "varying vec3 vNormal;",
        "void main() {",
        "vNormal = normalize( normalMatrix * normal );",
        "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
        "}"
      ].join("\n"),
      fragmentShader: [
        "varying vec3 vNormal;",
        "void main() {",
        "float intensity = pow( 0.8 - dot( vNormal, vec3( 0, 0, 1.0 ) ), 12.0 );",
        "gl_FragColor = vec4( 1.0, 1.0, 1.0, 0.5 ) * intensity;",
        "}"
      ].join("\n")
    }
  };

  var camera, scene, renderer, w, h;
  var mesh, atmosphere, point;

  var overRenderer;

  var curZoomSpeed = 0;
  var zoomSpeed = 50;

  var cureves = [];

  var mouse = { x: 0, y: 0 },
    mouseOnDown = { x: 0, y: 0 };
  var rotation = { x: 0, y: 0 },
    incr_rotation = { x: -0.001, y: 0 }, //incr rotataional speed
    target = { x: (Math.PI * 3) / 2, y: Math.PI / 6.0 },
    targetOnDown = { x: 0, y: 0 };

  var distance = 100000,
    distanceTarget = 100000;
  var padding = 40;
  var PI_HALF = Math.PI / 2;

  var tempoints = [];

  function init() {
    // container.style.color = '#fff';
    container.style.font = "13px/20px Arial, sans-serif";

    var shader, uniforms, material;
    w = window.innerWidth;
    h = window.innerHeight;

    camera = new THREE.PerspectiveCamera(30, w / h, 0.1, 1500);
    // camera.position.z = distance;

    scene = new THREE.Scene();

    var geometry = new THREE.SphereGeometry(200, 40, 30);

    shader = Shaders["earth"];
    uniforms = THREE.UniformsUtils.clone(shader.uniforms);

    uniforms["texture"].value = new THREE.TextureLoader().load(world);
    // imgDir + "world.jpg"
    material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader
    });

    mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.y = Math.PI;
    mesh.name = "globeObj";
    scene.add(mesh);

    shader = Shaders["atmosphere"];
    uniforms = THREE.UniformsUtils.clone(shader.uniforms);

    material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true
    });

    var curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(99, 99, 99)
    ]);

    var points = curve.getPoints(50);
    var geometry = new THREE.BufferGeometry().setFromPoints(points);

    var material = new THREE.LineBasicMaterial({
      color: 0xff0000,
      linewidth: 60,
      fog: true
    });

    // Create the final object to add to the scene
    var curveObject = new THREE.Line(geometry, material);

    //scene.add(curveObject);

    mesh = new THREE.Mesh(geometry, material);
    mesh.scale.set(1.1, 1.1, 1.1);

    scene.add(mesh);

    geometry = new THREE.BoxGeometry(0.75, 0.75, 1);
    geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0, -0.5));

    point = new THREE.Mesh(geometry);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    alpha: true;
    renderer.setSize(w, h);
    renderer.setClearColor(0x000000, 0); // set background color to transparent

    // renderer.domElement.style.position = "absolute";

    container.appendChild(renderer.domElement);

    container.addEventListener("mousedown", onMouseDown, false);

    container.addEventListener("mousewheel", onMouseWheel, false);

    document.addEventListener("keydown", onDocumentKeyDown, false);

    window.addEventListener("resize", onWindowResize, false);

    container.addEventListener(
      "mouseover",
      function() {
        overRenderer = true;
      },
      false
    );

    container.addEventListener(
      "mouseout",
      function() {
        overRenderer = false;
      },
      false
    );
  }

  function addData(data, opts) {
    var lat, lng, size, color, i, step, colorFnWrapper;

    opts.animated = opts.animated || false;
    this.is_animated = opts.animated;
    opts.format = opts.format || "magnitude"; // other option is 'legend'
    if (opts.format === "magnitude") {
      step = 3;
      colorFnWrapper = function(data, i) {
        return colorFn(data[i + 2]);
      };
    } else if (opts.format === "legend") {
      step = 4;
      colorFnWrapper = function(data, i) {
        return colorFn(data[i + 3]);
      };
    } else {
      throw "error: format not supported: " + opts.format;
    }

    if (opts.animated) {
      if (this._baseGeometry === undefined) {
        this._baseGeometry = new THREE.Geometry();
        for (i = 0; i < data.length; i += step) {
          lat = data[i];
          lng = data[i + 1];
          //        size = data[i + 2];
          color = colorFnWrapper(data, i);
          size = 0;
          addPoint(lat, lng, size, color, this._baseGeometry);
        }
      }
      if (this._morphTargetId === undefined) {
        this._morphTargetId = 0;
      } else {
        this._morphTargetId += 1;
      }
      opts.name = opts.name || "morphTarget" + this._morphTargetId;
    }
    var subgeo = new THREE.Geometry();
    for (i = 0; i < data.length; i += step) {
      lat = data[i];
      lng = data[i + 1];
      color = colorFnWrapper(data, i);
      size = data[i + 2];
      size = size * 200;

      if (i + step == data.length) {
        color = { r: 0, g: 1, b: 0 };
      }

      addPoint(lat, lng, size, color, subgeo);
    }
    if (opts.animated) {
      this._baseGeometry.morphTargets.push({
        name: opts.name,
        vertices: subgeo.vertices
      });
    } else {
      this._baseGeometry = subgeo;
    }
  }

  function createPoints() {
    if (this._baseGeometry !== undefined) {
      if (this.is_animated === false) {
        this.points = new THREE.Mesh(
          this._baseGeometry,
          new THREE.MeshBasicMaterial({
            color: 0xffffff,
            vertexColors: THREE.FaceColors,
            morphTargets: false
          })
        );
      } else {
        if (this._baseGeometry.morphTargets.length < 8) {
          var padding = 8 - this._baseGeometry.morphTargets.length;

          for (var i = 0; i <= padding; i++) {
            this._baseGeometry.morphTargets.push({
              name: "morphPadding" + i,
              vertices: this._baseGeometry.vertices
            });
          }
        }
        this.points = new THREE.Mesh(
          this._baseGeometry,
          new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            vertexColors: THREE.FaceColors,
            morphTargets: true
          })
        );
      }

      let tempPoints = [];

      const lastpoint = tempoints[tempoints.length - 1];
      for (let index = 0; index < tempoints.length - 1; index++) {
        const element = tempoints[index];
        let temparray = [];
        temparray.push(element.lat);
        temparray.push(element.lng);
        temparray.push(parseFloat(lastpoint.lat));
        temparray.push(parseFloat(lastpoint.lng));
        tempPoints.push(temparray);
      }

      let newCurveMesh = new THREE.Mesh(
        this._baseGeometry,
        new THREE.MeshBasicMaterial({
          color: 0xffffff,
          vertexColors: THREE.FaceColors,
          morphTargets: true
        })
      );

      initCurves(tempPoints, newCurveMesh);

      playCurve();

      CurveMeshs = newCurveMesh;
      PillarMeshs = this.points;

      scene.add(this.points);
      scene.add(newCurveMesh);
    }
  }

  function returnPointVector3(lat, lng) {
    let vector3 = new THREE.Vector3(0, 0, 0);
    var phi = ((90 - lat) * Math.PI) / 180;
    var theta = ((180 - lng) * Math.PI) / 180;

    vector3.x = 200 * Math.sin(phi) * Math.cos(theta);
    vector3.y = 200 * Math.cos(phi);
    vector3.z = 200 * Math.sin(phi) * Math.sin(theta);

    return vector3;
  }

  function addPoint(lat, lng, size, color, subgeo) {
    var phi = ((90 - lat) * Math.PI) / 180;
    var theta = ((180 - lng) * Math.PI) / 180;

    point.position.x = 200 * Math.sin(phi) * Math.cos(theta);
    point.position.y = 200 * Math.cos(phi);
    point.position.z = 200 * Math.sin(phi) * Math.sin(theta);

    point.lookAt(mesh.position);

    point.scale.z = Math.max(size, 0.1); // avoid non-invertible matrix
    point.updateMatrix();

    tempoints.push({ lat: lat, lng: lng });

    for (var i = 0; i < point.geometry.faces.length; i++) {
      point.geometry.faces[i].color = color;
    }
    if (point.matrixAutoUpdate) {
      point.updateMatrix();
    }
    subgeo.merge(point.geometry, point.matrix);
  }

  function onMouseDown(event) {
    event.preventDefault();

    container.addEventListener("mousemove", onMouseMove, false);
    container.addEventListener("mouseup", onMouseUp, false);
    container.addEventListener("mouseout", onMouseOut, false);

    mouseOnDown.x = -event.clientX;
    mouseOnDown.y = event.clientY;

    targetOnDown.x = target.x;
    targetOnDown.y = target.y;

    container.style.cursor = "move";
  }

  function onMouseMove(event) {
    mouse.x = -event.clientX;
    mouse.y = event.clientY;

    var zoomDamp = distance / 1000;

    target.x = targetOnDown.x + (mouse.x - mouseOnDown.x) * 0.005 * zoomDamp;
    target.y = targetOnDown.y + (mouse.y - mouseOnDown.y) * 0.005 * zoomDamp;

    target.y = target.y > PI_HALF ? PI_HALF : target.y;
    target.y = target.y < -PI_HALF ? -PI_HALF : target.y;
  }

  function onMouseUp(event) {
    container.removeEventListener("mousemove", onMouseMove, false);
    container.removeEventListener("mouseup", onMouseUp, false);
    container.removeEventListener("mouseout", onMouseOut, false);
    container.style.cursor = "auto";
  }

  function onMouseOut(event) {
    container.removeEventListener("mousemove", onMouseMove, false);
    container.removeEventListener("mouseup", onMouseUp, false);
    container.removeEventListener("mouseout", onMouseOut, false);
  }

  function onMouseWheel(event) {
    event.preventDefault();
    if (overRenderer) {
      zoom(event.wheelDeltaY * 0.3);
    }
    return false;
  }

  function onDocumentKeyDown(event) {
    switch (event.keyCode) {
      case 38:
        zoom(100);
        event.preventDefault();
        break;
      case 40:
        zoom(-100);
        event.preventDefault();
        break;
    }
  }

  var prevW = 0;
  var prevH = 0;
  var scale = 1;
  function onWindowResize(event) {
    // if(prevH == 0 || prevW == 0)
    // {
    //   prevH = event.target.innerHeight;
    //   prevW = event.target.innerWidth;
    // }
    // else {
    //   scale = (event.target.innerHeight / prevH)*(event.target.innerWidth / prevW);
    //   prevH = event.target.innerHeight;
    //   prevW = event.target.innerWidth;
    // }
    // console.log(scene);
    // var glb = scene.getObjectByName("globeObj");
    // glb.scale(.5,.5);
    // console.log(event);
    // glb.scale.x = scale;
    // glb.scale.y = scale;
    // glb.scale.z = scale;
    // console.log(glb);
    // console.log(scene);
    // scene.scale = new Vector3(.9,.9,.9); // vector3 undefined might revisit.
    // console.log(container);

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function zoom(delta) {
    distanceTarget -= delta;
    distanceTarget = distanceTarget > 1200 ? 1200 : distanceTarget;
    distanceTarget = distanceTarget < 350 ? 350 : distanceTarget;
  }

  function animate() {
    requestAnimationFrame(animate);
    render();
  }

  function playCurve() {
    cureves.forEach(element => {
      element.restart();
      element.play();
    });
  }

  function removePoints() {
    cureves.forEach(element => {
      element.stop();
    });
    if (CurveMeshs != null) {
      scene.remove(CurveMeshs);
      CurveMeshs.geometry.dispose();
      CurveMeshs.material.dispose();
      CurveMeshs = null;
    }
    if (PillarMeshs != null) {
      scene.remove(PillarMeshs);
      PillarMeshs.geometry.dispose();
      PillarMeshs.material.dispose();
      PillarMeshs = null;
    }
  }

  function render() {
    zoom(curZoomSpeed);
    //playCurve();
    target.x += incr_rotation.x;
    rotation.x += (target.x - rotation.x) * 0.1;
    rotation.y += (target.y - rotation.y) * 0.1;
    distance += (distanceTarget - distance) * 0.3;

    camera.position.x = distance * Math.sin(rotation.x) * Math.cos(rotation.y);
    camera.position.y = distance * Math.sin(rotation.y);
    camera.position.z = distance * Math.cos(rotation.x) * Math.cos(rotation.y);

    camera.lookAt(mesh.position);

    renderer.render(scene, camera);
  }
  // TODO: Figure out where to set the color of the arcs. The following currerntly does it.
  function initCurves(allCoords, incomingmesh) {
    const material = new THREE.MeshBasicMaterial({
      blending: THREE.AdditiveBlending,
      opacity: 0.6,
      transparent: true,
      color: colorArch
    });
    const curveMesh = new THREE.Mesh();

    cureves.length = 0;
    allCoords.forEach((coords, index) => {
      const curve = new Curve(coords, material);
      cureves.push(curve);
      curveMesh.add(curve.mesh);
    });

    incomingmesh.add(curveMesh);
  }

  function Curve(coords, material) {
    const { spline } = getSplineFromCoords(coords);

    const curveSegments = 32;
    let index = 0;
    // add curve geometry
    const curveGeometry = new THREE.BufferGeometry();
    const points = new Float32Array(curveSegments * 3);
    const vertices = spline.getPoints(curveSegments - 1);

    for (let i = 0, j = 0; i < vertices.length; i++) {
      const vertex = vertices[i];
      points[j++] = vertex.x;
      points[j++] = vertex.y;
      points[j++] = vertex.z;
    }

    // !!!
    // You can use setDrawRange to animate the curve
    curveGeometry.addAttribute(
      "position",
      new THREE.BufferAttribute(points, 3)
    );
    curveGeometry.setDrawRange(0, 32);

    this.mesh = new THREE.Line(curveGeometry, material);
    //  this.mesh =  new THREE.MeshLine(curveGeometry, material);
    //  this.mesh.setGeometry(curveGeometry, function(p) {return 3;});

    this.hasStopped = () => index > curveSegments;

    this.play = () => {
      if (this.hasStopped()) return;
      index += 1;
      curveGeometry.setDrawRange(0, index);
      curveGeometry.attributes.position.needsUpdate = true;
      setTimeout(() => {
        this.play();
      }, 50);
    };

    this.stop = () => {
      curveGeometry.setDrawRange(0, curveSegments);
      this.index = curveSegments + 1;
    };

    this.restart = () => {
      index = 1;
      curveGeometry.setDrawRange(0, 1);
    };

    //isPlaying ? this.restart() : this.stop();
  }

  function getSplineFromCoords(coords) {
    const startLat = coords[0];
    const startLng = coords[1];
    const endLat = coords[2];
    const endLng = coords[3];

    const globeradius = 200;

    // spline vertices
    const start = coordinateToPosition(startLat, startLng, globeradius);
    const end = coordinateToPosition(endLat, endLng, globeradius);
    const altitude = clamp(start.distanceTo(end) * 0.75, 10, globeradius);
    const interpolate = geoInterpolate([startLng, startLat], [endLng, endLat]);
    const midCoord1 = interpolate(0.25);
    const midCoord2 = interpolate(0.75);
    const mid1 = coordinateToPosition(
      midCoord1[1],
      midCoord1[0],
      globeradius + altitude
    );
    const mid2 = coordinateToPosition(
      midCoord2[1],
      midCoord2[0],
      globeradius + altitude
    );

    return {
      start,
      end,
      spline: new THREE.CubicBezierCurve3(start, mid1, mid2, end)
    };
  }
  function clamp(num, min, max) {
    return num <= min ? min : num >= max ? max : num;
  }

  function coordinateToPosition(lat, lng, radius) {
    const DEGREE_TO_RADIAN = Math.PI / 180;
    const phi = (90 - lat) * DEGREE_TO_RADIAN;
    const theta = lng * DEGREE_TO_RADIAN;

    return new THREE.Vector3(
      -radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
  }

  init();
  this.animate = animate;

  this.__defineGetter__("time", function() {
    return this._time || 0;
  });

  this.__defineSetter__("time", function(t) {
    var validMorphs = [];
    var morphDict = this.points.morphTargetDictionary;
    for (var k in morphDict) {
      if (k.indexOf("morphPadding") < 0) {
        validMorphs.push(morphDict[k]);
      }
    }
    validMorphs.sort();
    var l = validMorphs.length - 1;
    var scaledt = t * l + 1;
    var index = Math.floor(scaledt);
    for (i = 0; i < validMorphs.length; i++) {
      this.points.morphTargetInfluences[validMorphs[i]] = 0;
    }
    var lastIndex = index - 1;
    var leftover = scaledt - index;
    if (lastIndex >= 0) {
      this.points.morphTargetInfluences[lastIndex] = 1 - leftover;
    }
    this.points.morphTargetInfluences[index] = leftover;
    this._time = t;
  });

  this.addData = addData;
  this.createPoints = createPoints;
  this.renderer = renderer;
  this.scene = scene;
  this.removePoints = removePoints;
  this.playCurve = playCurve;

  return this;
});
