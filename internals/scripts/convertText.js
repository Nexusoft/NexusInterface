import fs from 'fs';
import path from 'path';

const regex = /_`([^`]*)`/gm;

function convertFile(filePath) {
  console.log('Converting file', filePath);
  const content = fs.readFileSync(filePath).toString();
  const newContent = content.replace(
    regex,
    (oldText, content) => `_('${content.replace(/'/gm, "\\'")}')`
  );
  fs.writeFileSync(filePath, newContent);
}

function convertFolder(folderPath) {
  const names = fs.readdirSync(folderPath);
  for (let name of names) {
    const fullPath = path.join(folderPath, name);
    if (fs.statSync(fullPath).isDirectory()) {
      convertFolder(fullPath);
    } else if (name.endsWith('.js')) {
      convertFile(fullPath);
    }
  }
}

convertFolder(path.resolve(__dirname, '../../src'));
