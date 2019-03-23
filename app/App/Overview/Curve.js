import * as THREE from 'three';
import { geoInterpolate } from 'd3-geo';

function getSplineFromCoords(pointOne, pointTwo) {
  const start = coordinateToPosition(pointOne.lat, pointOne.lng, 125);
  const end = coordinateToPosition(pointTwo.lat, pointTwo.lng, 125);
  const altitude = clamp(start.distanceTo(end) * 0.35, 10, 125);
  const interpolate = geoInterpolate(
    [pointOne.lng, pointOne.lat],
    [pointTwo.lng, pointTwo.lat]
  );
  const midCoord1 = interpolate(0.25);
  const midCoord2 = interpolate(0.75);
  const mid1 = coordinateToPosition(midCoord1[1], midCoord1[0], 125 + altitude);
  const mid2 = coordinateToPosition(midCoord2[1], midCoord2[0], 125 + altitude);

  return new THREE.CubicBezierCurve3(start, mid1, mid2, end);
}

function clamp(num, min, max) {
  return num <= min ? min : num >= max ? max : num;
}

function coordinateToPosition(lat, lng, radius) {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = (-lng * Math.PI) / 180;

  return new THREE.Vector3(
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

export default class Curve {
  constructor(pointOne, pointTwo, params) {
    this.pointOne = pointOne;
    this.pointTwo = pointTwo;

    const material = new THREE.LineBasicMaterial({
      blending: THREE.AdditiveBlending,
      opacity: params.opacity || 0.6,
      transparent: true,
      color: params.color || '#00ffff',
      linewidth: params.linewidth || 1.6,
      linejoin: 'bevel',
    });

    this.index = 0;
    this.curveSegments = 50;
    this.curveGeometry = new THREE.BufferGeometry();

    const spline = getSplineFromCoords(this.pointOne, this.pointTwo);
    const vertices = spline.getPoints(this.curveSegments - 1);
    const points = new Float32Array(this.curveSegments * 3);
    for (let i = 0, j = 0; i < vertices.length; ++i) {
      const vertex = vertices[i];
      points[j++] = vertex.x;
      points[j++] = vertex.y;
      points[j++] = vertex.z;
    }

    this.curveGeometry.addAttribute(
      'position',
      new THREE.BufferAttribute(points, 3)
    );
    this.curveGeometry.setDrawRange(0, 50);

    this.arc = new THREE.Line(this.curveGeometry, material);
  }

  play = () => {
    if (this.index > this.curveSegments) {
      this.index = 0;
      return;
    }
    this.index += 1;
    this.curveGeometry.setDrawRange(0, this.index);
    this.curveGeometry.attributes.position.needsUpdate = true;
    setTimeout(() => {
      this.play();
    }, 40);
  };

  stop = () => {
    this.curveGeometry.setDrawRange(0, this.curveSegments);
    this.index = this.curveSegments + 1;
  };

  restart = () => {
    this.index = 1;
    this.curveGeometry.setDrawRange(0, 1);
  };
}
