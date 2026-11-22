// Place the flat map's seam at 168 W instead of the antimeridian, keeping
// eastern Russia contiguous. Share this offset with the texture shader.
export const MAP_CENTER_LONGITUDE = 12;

export function mapX(longitude) {
  return (((longitude - MAP_CENTER_LONGITUDE + 180) % 360 + 360) % 360 - 180) * 2;
}
