import fs from 'fs';
import tar from 'tar';

export default function extractTarball(source, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest);
  }

  return new Promise((resolve, reject) => {
    try {
      fs.createReadStream(source)
        .pipe(tar.extract({ C: dest }))
        .on('error', function(er) {
          console.log('bootstrap error', er);
          reject(er);
        })
        .on('end', function() {
          resolve(null);
        });
    } catch {
      e => console.log('Extract Error', e);
    }
  });
}
