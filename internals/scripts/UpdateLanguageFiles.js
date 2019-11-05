import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import csv from 'csvtojson';

const transDir = path.join(__dirname, '../../assets/translations');

const locales = [
  { nxsCode: 'ar', crowdinCode: 'ar', crowdinFolder: 'ar' },
  { nxsCode: 'de', crowdinCode: 'de', crowdinFolder: 'de' },
  { nxsCode: 'es', crowdinCode: 'es', crowdinFolder: 'es-ES' },
  { nxsCode: 'fi', crowdinCode: 'fi', crowdinFolder: 'fi' },
  { nxsCode: 'fr', crowdinCode: 'fr', crowdinFolder: 'fr' },
  { nxsCode: 'ja', crowdinCode: 'ja', crowdinFolder: 'ja' },
  { nxsCode: 'hu', crowdinCode: 'hu', crowdinFolder: 'hu' },
  { nxsCode: 'ko', crowdinCode: 'ko', crowdinFolder: 'ko' },
  { nxsCode: 'nl', crowdinCode: 'nl', crowdinFolder: 'nl' },
  { nxsCode: 'pl', crowdinCode: 'pl', crowdinFolder: 'pl' },
  { nxsCode: 'pt', crowdinCode: 'pt', crowdinFolder: 'pt-PT' },
  { nxsCode: 'ro', crowdinCode: 'ro', crowdinFolder: 'ro' },
  { nxsCode: 'ru', crowdinCode: 'ru', crowdinFolder: 'ru' },
  { nxsCode: 'zh-cn', crowdinCode: 'zh-Hans', crowdinFolder: 'zh-CN' },
];

var newUpdates = {};
locales.forEach(locale => {
  let tempObj = {};
  csv(
    {
      noheader: true,
    },
    {
      objectMode: true,
    }
  )
    .fromFile(
      path.join(
        transDir + '/Update/' + locale.crowdinFolder,
        locale.crowdinCode + '.csv'
      )
    )
    .on('data', data => {
      tempObj[data.field1] = !!data.field2 ? data.field2 : null;
    })
    .then(jsonOBJ => {
      console.log(chalk.yellow.bold(`Found ${locale.nxsCode} Updates.\n`));
      newUpdates[locale.nxsCode] = jsonOBJ;
      fs.writeFileSync(
        path.join(transDir, locale.nxsCode + '.json'),
        JSON.stringify(tempObj, null, 2)
      );
      console.log(chalk.yellow.bold(`${locale.nxsCode} Updated.\n`));
    });
});
