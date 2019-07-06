import fs from 'fs';
import path from 'path';
import { assetsDir } from 'consts/paths';

const languages = {};

export function getMessages(locale) {
  if (!languages[locale]) {
    const filePath = path.join(assetsDir, 'languages', `${locale}.json`);
    const messages = JSON.parse(fs.readFileSync(filePath));
    languages[locale] = messages;
  }

  return languages[locale];
}
