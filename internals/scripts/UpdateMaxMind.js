const chalk = require('chalk');
const https = require('https');
const path = require('path');
const fs = require('fs');
const tar = require('tar');

let extractedLoc = null;
function extractTarball(source, dest) {
  return new Promise((resolve, reject) => {
    fs.createReadStream(source)
      .pipe(tar.extract({ C: dest }))
      .on('entry', entry => {
        if (!extractedLoc) {
          extractedLoc = entry.absolute;
        }
      })
      .on('error', function(er) {
        reject(er);
      })
      .on('end', function() {
        resolve(null);
      });
  });
}

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
    .on('response', response => {
      let downloaded = 0;

      response.on('data', chunk => {
        downloaded += chunk.length;
        console.log(chalk.green.bold(downloaded));
      });

      response.pipe(
        fs
          .createWriteStream(fileLocation, { autoClose: true })
          .on('error', e => {
            reject(e);
          })
          .on('close', () => {
            console.log(fileLocation);
            resolve();
          })
      );
    })
    .on('error', e => reject(e))
    .on('timeout', function() {
      if (downloadRequest) downloadRequest.abort();
      reject(new Error('Request timeout!'));
    })
    .on('abort', function() {
      clearTimeout(timerId);
      if (fs.existsSync(fileLocation)) {
        fs.unlink(fileLocation, err => {
          if (err) console.error(err);
        });
      }
      resolve();
    });
});

try {
  promise.then(e => {
    console.log(chalk.green.bold('Finished Downloading'));
    extractTarball(
      fileLocation,
      process.platform === 'win32' || process.platform === 'darwin'
        ? appDataDir
        : process.env.HOME
    ).then(e => {
      const dest = path.join(
        __dirname,
        '../..',
        '/assets/GeoLite2-City',
        path.basename(extractedLoc)
      );
      fs.rename(extractedLoc, dest, err => {
        if (err) return console.error(err);

        console.log(chalk.yellowBright.bold('Success!'));
        fs.unlink(fileLocation, err => {
          if (err) console.error(err);
        });
        fs.unlink(extractedLoc, err => {
          if (err) console.error(err);
        });
        console.log(chalk.yellowBright.bold('Deleted Old Files'));
      });
    });
  });
} finally {
}
