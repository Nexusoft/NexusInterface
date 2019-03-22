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
  const DEGREE_TO_RADIAN = Math.PI / 180;
  const phi = (90 - lat) * DEGREE_TO_RADIAN;
  const theta = lng * DEGREE_TO_RADIAN;

  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

export default class Curve {
  constructor(pointOne, pointTwo, style) {
    this.pointOne = pointOne;
    this.pointTwo = pointTwo;
    const material = new THREE.LineBasicMaterial({
      blending: THREE.AdditiveBlending,
      opacity: 0.6, // style.opacity,
      transparent: true,
      color: '#00ffff', // style.color,
      linewidth: 1.6, // style.width,
      linejoin: 'bevel',
    });

    this.curveSegments = 40;
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
    this.curveGeometry.setDrawRange(0, 32);

    this.mesh = new THREE.Line(this.curveGeometry, material);
  }

  hasStopped = () => index > curveSegments;

  play = () => {
    if (this.hasStopped()) return;
    index += 1;
    this.curveGeometry.setDrawRange(0, index);
    this.curveGeometry.attributes.position.needsUpdate = true;
    setTimeout(() => {
      this.play();
    }, 50);
  };

  stop = () => {
    this.curveGeometry.setDrawRange(0, this.curveSegments);
    this.index = this.curveSegments + 1;
  };

  restart = () => {
    index = 1;
    this.curveGeometry.setDrawRange(0, 1);
  };
}
