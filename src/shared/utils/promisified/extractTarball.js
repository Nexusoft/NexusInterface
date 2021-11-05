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
        .on('error', function (err) {
          console.error(err);
          reject(err);
        })
        .on('end', function () {
          resolve(null);
        });
    } catch {
      (err) => console.error(err);
    }
  });
}
