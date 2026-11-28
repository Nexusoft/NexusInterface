import * as THREE from 'three';
import Color from 'color';
import { mapX } from './mapProjection';

/**
 * The point/pillar on the globe
 *
 * @export
 * @class Point
 */
export default class Point {
  constructor(lat, lng, params) {
    this.lat = lat;
    this.lng = lng;
    this.params = params || {};
    const width = this.params.mapLayout
      ? Math.max(2, 0.4 * this.params.peerConnections)
      : 0.5 * this.params.peerConnections;
    const height = (10 + 2 * this.params.peerConnections) * (this.params.mapLayout ? 1.5 : 1.4);
    const geometry = new THREE.BoxGeometry(
      width,
      height,
      width
    );
    this.pillar = new THREE.Mesh(geometry);

    const latRad = lat * (Math.PI / 180);
    const lonRad = -lng * (Math.PI / 180);
    const phi = ((90 - lat) * Math.PI) / 180;
    const theta = (-lng * Math.PI) / 180;

    this.pillar.position.x = 125 * Math.sin(phi) * Math.cos(theta);
    this.pillar.position.y = 125 * Math.cos(phi);
    this.pillar.position.z = 125 * Math.sin(phi) * Math.sin(theta);
    this.pillar.rotation.set(0.0, -lonRad, latRad - Math.PI * 0.5);
    if (this.params.mapLayout) {
      this.pillar.position.set(mapX(lng), geometry.parameters.height / 2, -lat * 2);
      this.pillar.rotation.set(0, 0, 0);
    }
    this.pillar.name = params.name || 'Not Found';

    let color = params.color || '#44EB08';
    this.setColor(color);
  }

  /**
   * Sets color of the point
   *
   * @param {string} hex
   * @memberof Point
   */
  setColor(hex) {
    const color = Color(hex);
    this.pillar.material.color.set(color.hex());
    this.pillar.material.opacity = color.alpha();
    this.pillar.material.transparent = true;
    this.pillar.material.depthWrite = color.alpha() === 1;
  }
}
