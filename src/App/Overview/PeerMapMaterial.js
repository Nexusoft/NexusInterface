import * as THREE from 'three';
import Color from 'color';
import { MAP_CENTER_LONGITUDE } from './mapProjection';

// Shade the existing geographic texture in place so peer coordinates remain
// exact. Only the flat map uses this material; the globe retains its texture.
export default function createPeerMapMaterial(map, landColor = '#0097e4', glowColor = '#00ffff') {
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      worldMap: { value: map },
      landOpacity: { value: Color(landColor).alpha() },
      glowOpacity: { value: Color(glowColor).alpha() },
      longitudeOffset: { value: MAP_CENTER_LONGITUDE / 360 },
      landColor: { value: new THREE.Color(Color(landColor).hex()) },
      glowColor: { value: new THREE.Color(Color(glowColor).hex()) },
    },
    vertexShader: `
      varying vec2 mapUV;
      void main() {
        mapUV = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D worldMap;
      uniform float longitudeOffset;
      uniform float landOpacity;
      uniform float glowOpacity;
      uniform vec3 landColor;
      uniform vec3 glowColor;
      varying vec2 mapUV;

      vec2 sourceUV(vec2 uv) {
        return vec2(fract(uv.x + longitudeOffset), uv.y);
      }

      float landAt(vec2 uv) {
        if (uv.y < 1.0 / 6.0) return 0.0;
        return 1.0 - smoothstep(0.35, 0.65, texture2D(worldMap, sourceUV(uv)).r);
      }

      void main() {
        if (mapUV.y < 1.0 / 6.0) discard;
        float land = landAt(mapUV);
        float coast = 0.0;
        float nearGlow = 0.0;
        float farGlow = 0.0;
        // Correct for the 2:1 map aspect ratio to keep the halo circular.
        for (int i = 0; i < 12; i++) {
          float angle = float(i) * 6.2831853 / 12.0;
          vec2 direction = vec2(cos(angle) * 0.5, sin(angle));
          coast += abs(land - landAt(mapUV + direction * 0.0012));
          nearGlow += landAt(mapUV + direction * 0.009);
          farGlow += landAt(mapUV + direction * 0.022);
        }
        coast /= 12.0;
        nearGlow /= 12.0;
        farGlow /= 12.0;
        float detail = texture2D(worldMap, sourceUV(mapUV)).r * land;
        float halo = (1.0 - land) * (farGlow * 0.18 + nearGlow * 0.4);
        float edge = clamp(coast * 1.2, 0.0, 1.0);
        // Keep coastlines at the selected color while shading the solid land.
        float outline = smoothstep(0.05, 0.3, coast);
        vec3 fill = mix(landColor * 0.38, glowColor, max(detail * 0.35, outline));
        float alpha = max(land, clamp(halo + edge, 0.0, 1.0));
        alpha *= mix(glowOpacity, mix(landOpacity, glowOpacity, max(detail * 0.35, outline)), land);
        if (alpha < 0.005) discard;
        gl_FragColor = vec4(mix(glowColor, fill, land), alpha);
      }
    `,
  });
  // Participate in the renderer's existing texture cleanup on unmount.
  material.map = map;
  return material;
}
