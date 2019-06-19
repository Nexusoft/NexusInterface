import fs from 'fs';
import tar from 'tar';

export default function extractTarball(source, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest);
  }

  return new Promise((resolve, reject) => {
    fs.createReadStream(source)
      .pipe(tar.extract({ C: dest }))
      .on('error', function(er) {
        reject(er);
      })
      .on('end', function() {
        resolve(null);
      });
  });
}
