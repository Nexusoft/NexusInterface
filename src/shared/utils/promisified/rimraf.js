import { default as rmrf } from 'rimraf';

export default function rimraf(f, options) {
  return new Promise((resolve, reject) => {
    rmrf(f, options, (err) => {
      if (!err) resolve();
      else reject(err);
    });
  });
}
