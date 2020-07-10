import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

const srcDir = path.join(__dirname, '../../src');
const actionTypesPath = path.join(srcDir, 'shared/consts/actionTypes.js');
const content = fs.readFileSync(actionTypesPath).toString();
const matches = [...content.matchAll(/export const (\S*?) =/g)];
const actionTypes = matches.map(([str, at]) => at);

function checkFile(filePath) {
  const fileContent = fs.readFileSync(filePath).toString();
  const actionTypesCopy = [...actionTypes];
  actionTypesCopy.forEach((at) => {
    if (fileContent.includes(at)) {
      const index = actionTypes.indexOf(at);
      actionTypes.splice(index, 1);
    }
  });
}

function checkFolder(dirPath) {
  const items = fs.readdirSync(dirPath);
  items.forEach((item) => {
    const itemPath = path.join(dirPath, item);
    const stat = fs.statSync(itemPath);
    if (stat.isDirectory()) {
      checkFolder(itemPath);
    } else {
      checkFile(itemPath);
    }
  });
}

const reducersDir = path.join(srcDir, 'shared/store/reducers');
checkFolder(reducersDir);

let newContent = content;
actionTypes.forEach((at) => {
  newContent = newContent.replace(new RegExp(`export const ${at} = .*\n`), '');
});
console.log(chalk.yellow.bold('Unused action types:'));
actionTypes.forEach((at) => {
  console.log(at);
});

fs.writeFileSync(actionTypesPath, newContent);
