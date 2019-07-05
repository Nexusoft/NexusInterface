import extract from 'extract-zip';

export default function extractZip(source, options) {
  return new Promise((resolve, reject) => {
    try {
      extract(source, options, err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    } catch (err) {
      console.error(err);
      reject(err);
    }
  });
}
