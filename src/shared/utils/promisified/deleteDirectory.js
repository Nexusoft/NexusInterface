import rimraf from 'rimraf';

// TODO: make this a common utility
export default function deleteDirectory(path, options = {}) {
  return new Promise((resolve, reject) => {
    try {
      rimraf(path, options, (err) => {
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
