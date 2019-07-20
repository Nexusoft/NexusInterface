import fs from 'fs';
import path from 'path';
import { assetsDir } from 'consts/paths';
import { LoadSettings } from 'lib/settings';

const { locale } = LoadSettings();
const translations = locale === 'en' ? null : JSON.parse(
  fs.readFileSync(path.join(assetsDir, 'languages', `${locale}.json`))
);

export default (enText, data) => {
  const text = locale === 'en' ?
};
