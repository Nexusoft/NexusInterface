import fs from 'fs';
import { dirname } from 'path';
import axios from 'axios';

import ensureDirExists from 'utils/ensureDirExists';

export default function downloadFile(url, path) {
  return new Promise(async (resolve, reject) => {
    try {
      await ensureDirExists(dirname(path));
      const writer = fs.createWriteStream(path);
      writer.on('finish', resolve);
      writer.on('error', reject);

      const response = await axios.get(url, { responseType: 'stream' });
      response.data.pipe(writer);
    } catch (err) {
      reject(err);
    }
  });
}
