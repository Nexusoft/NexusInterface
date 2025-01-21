/**
 * Important note - This file is imported into module_preload.js, either directly or
 * indirectly, and will be a part of the preload script for modules, therefore:
 * - Be picky with importing stuffs into this file, especially for big
 * files and libraries. The bigger the preload scripts get, the slower the modules
 * will load.
 * - Don't assign anything to `global` variable because it will be passed
 * into modules' execution environment.
 * - Make sure this note also presents in other files which are imported here.
 */

import Color from 'color';

export function negate(color: string) {
  return Color(color).negate().string();
}

export function lighten(color: string, value: number) {
  return Color(color).lighten(value).string();
}

export function darken(color: string, value: number) {
  return Color(color).darken(value).string();
}

export function saturate(color: string, value: number) {
  return Color(color).saturate(value).string();
}

export function desaturate(color: string, value: number) {
  return Color(color).desaturate(value).string();
}

export function grayscale(color: string) {
  return Color(color).grayscale().string();
}

export function whiten(color: string, value: number) {
  return Color(color).whiten(value).string();
}

export function blacken(color: string, value: number) {
  return Color(color).blacken(value).string();
}

export function fade(color: string, value: number) {
  return Color(color).fade(value).string();
}

export function opaquer(color: string, value: number) {
  return Color(color).opaquer(value).string();
}

export function rotate(color: string, value: number) {
  return Color(color).rotate(value).string();
}

export function mix(color1: string, color2: string, value: number) {
  return Color(color1).mix(Color(color2), value).string();
}

export function isLight(color: string) {
  return Color(color).isLight();
}

export function isDark(color: string) {
  return Color(color).isDark();
}

export function toHex(color: string) {
  return Color(color).hex();
}

export function luminosity(color: string) {
  return Color(color).luminosity();
}
