import fs from 'fs';
import path from 'path';

const enContent = fs.readFileSync(
  path.resolve(__dirname, '../../assets/languages/en.json')
);
const en = JSON.parse(enContent);

const regex = /translate\('([^']*)', [^\)]+\)/gm;

function convertFile(filePath) {
  // console.log('Converting file', filePath);
  const content = fs.readFileSync(filePath).toString();
  const newContent = content.replace(regex, (oldText, id) => {
    const translation = en[id];
    if (!translation) {
      console.log('Cannot find id', id);
      return oldText;
    } else {
      // console.log('Converted id', id);
      return `_('${translation.replace(/'/gm, "\\'")}')`;
    }
  });
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
