const chalk = require('chalk');
const https = require('https');
const path = require('path');
const fs = require('fs');

let downloadRequest = null;
const fileLocation =
  (process.platform === 'win32' || process.platform === 'darwin'
    ? appDataDir
    : process.env.HOME) + '/maxmindDatabase.tar.gz';
const maxmindAPIKey = 'XXXXXXXXX';
const promise = new Promise((resolve, reject) => {
  let timerId;
  downloadRequest = https
    .get(
      `https://download.maxmind.com/app/geoip_download?edition_id=GeoLite2-City&license_key=${maxmindAPIKey}&suffix=tar.gz`
    )
    .setTimeout(60000)
    .on('response', (response) => {
      let downloaded = 0;

      response.on('data', (chunk) => {
        downloaded += chunk.length;
        console.log(chalk.green.bold(downloaded));
      });

      response.pipe(
        fs
          .createWriteStream(fileLocation, { autoClose: true })
          .on('error', (e) => {
            reject(e);
          })
          .on('close', () => {
            console.log(fileLocation);
            resolve();
          })
      );
    })
    .on('error', (e) => reject(e))
    .on('timeout', function () {
      if (downloadRequest) downloadRequest.abort();
      reject(new Error('Request timeout!'));
    })
    .on('abort', function () {
      clearTimeout(timerId);
      if (fs.existsSync(fileLocation)) {
        fs.unlink(fileLocation, (err) => {
          if (err) console.error(err);
        });
      }
      resolve();
    });
});

try {
  promise.then((e) => {
    console.log(chalk.green.bold('Finished Downloading'));
  });
} finally {
}
