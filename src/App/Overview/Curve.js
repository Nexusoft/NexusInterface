import * as THREE from 'three';
import { geoInterpolate } from 'd3-geo';

/**
 * Creates a spline from one point to the next
 *
 * @memberof Curve
 * @param {*} pointOne Contains {lat and lng}
 * @param {*} pointTwo Contains {lat and lng}
 * @returns {THREE.CubicBezierCurve3}
 */
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

/**
 * Clamp a number between min and max
 *
 * @memberof Curve
 * @param {Number} num Input Value
 * @param {Number} min Min Value
 * @param {Number} max Max Value
 * @returns {Number} Return Value
 */
function clamp(num, min, max) {
  return num <= min ? min : num >= max ? max : num;
}

/**
 * Translates a Lat and Lng to a Vector3 on a sphere
 *
 * @memberof Curve
 * @param {Number} lat Latitude
 * @param {Number} lng longitude
 * @param {Number} radius radius of sphere
 * @returns {THREE.Vector3} Point on sphere
 */
function coordinateToPosition(lat, lng, radius) {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = (-lng * Math.PI) / 180;

  return new THREE.Vector3(
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

/**
 * Object for the Curves on the globe
 *
 * @export
 * @class Curve
 */
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

    this.curveGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(points, 3)
    );
    this.curveGeometry.setDrawRange(0, 50);

    this.arc = new THREE.Line(this.curveGeometry, material);
  }

  /**
   * Play the Animation
   *
   * @memberof Curve
   */
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

  /**
   * Stop the animation
   *
   * @memberof Curve
   */
  stop = () => {
    this.curveGeometry.setDrawRange(0, this.curveSegments);
    this.index = this.curveSegments + 1;
  };

  /**
   * Restart the animation
   *
   * @memberof Curve
   */
  restart = () => {
    this.index = 1;
    this.curveGeometry.setDrawRange(0, 1);
  };
}
