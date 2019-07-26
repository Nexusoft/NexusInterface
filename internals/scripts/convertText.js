import fs from 'fs';
import path from 'path';

const dir = path.resolve(__dirname, '../../assets/languages');
const enContent = fs.readFileSync(path.join(dir, 'en.json'));
const en = JSON.parse(enContent);

function convertFile(name) {
  const filePath = path.join(dir, name + '.json');
  const content = fs.readFileSync(filePath).toString();
  const trans = JSON.parse(content);
  const newTrans = {};
  for (let [key, value] of Object.entries(en)) {
    if (trans[key]) {
      // if (newTrans[value] && newTrans[value] !== trans[key]) {
      //   console.log('Conflict!');
      //   console.log('Key', key);
      //   console.log('Value 1', newTrans[value]);
      //   console.log('Value 2', trans[key]);
      //   return;
      // }

      newTrans[value] = trans[key];
    } else if (!newTrans[value]) {
      newTrans[value] = null;
    }
  }
  fs.writeFileSync(filePath, JSON.stringify(newTrans, null, 2));
}

convertFile('en');
