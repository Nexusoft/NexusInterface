import fs from 'fs';
import path from 'path';
import config from 'api/configuration';

const languages = {};

export function getMessages(locale) {
  if (!languages[locale]) {
    const filePath = path.join(
      config.GetAssetsDir(),
      'languages',
      `${locale}.json`
    );
    const messages = JSON.parse(fs.readFileSync(filePath));
    languages[locale] = messages;
  }

  return languages[locale];
}
