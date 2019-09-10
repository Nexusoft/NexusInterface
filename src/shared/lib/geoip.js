import path from 'path';
import fs from 'fs';
import { Reader } from 'maxmind';

import { assetsDir } from 'consts/paths';

const buffer = fs.readFileSync(
  path.join(assetsDir, 'GeoLite2-City', 'GeoLite2-City.mmdb')
);
const geoip = new Reader(buffer);

export default geoip;
