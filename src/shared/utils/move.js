import {
  stat,
  mkdir,
  readdir,
  rename,
  copyFile,
  unlink,
} from 'node:fs/promises';
import path from 'node:path';

export default async function move(source, destination) {
  const sourceStat = await stat(source);
  if (sourceStat.isDirectory()) {
    await mkdir(path.dirname(destination), {
      recursive: true,
    });

    const subFiles = await readdir(source);
    for (let fileName of subFiles) {
      const sourcePath = path.join(source, fileName);
      const destPath = path.join(destination, fileName);
      move(sourcePath, destPath);
    }
  } else {
    try {
      await rename(source, destination);
    } catch (error) {
      if (error.code === 'EXDEV') {
        // source and destination are not on the same partition
        await copyFile(source, destination);
        await unlink(source);
      } else {
        throw error;
      }
    }
  }
}
