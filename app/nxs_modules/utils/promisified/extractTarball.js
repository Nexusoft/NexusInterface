import tarball from 'tarball-extract';

export default function extractTarball(source, dest) {
  return new Promise((resolve, reject) => {
    tarball.extractTarball(source, dest, err => {
      if (err) reject(err);
      else resolve();
    });
  });
}
