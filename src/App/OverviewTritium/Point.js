import * as THREE from 'three';

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
    const geometry = new THREE.BoxGeometry(
      0.25 * this.params.peerConnections,
      10 + 2 * this.params.peerConnections,
      0.25 * this.params.peerConnections
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
    this.pillar.material.color.set(hex);
  }
}
