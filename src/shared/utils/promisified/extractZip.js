import extract from 'extract-zip';

export default function extractZip(source, options) {
  return new Promise(async (resolve, reject) => {
    try {
      await extract(source, options);
      resolve();
    } catch (err) {
      console.error(err);
      reject(err);
    }
  });
}
