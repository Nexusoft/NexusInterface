/**
 *
 * Express server serving static files for modules
 *
 */
import { normalize } from 'path';
import express from 'express';
import log from 'electron-log';

import { modulesDir } from 'consts/paths';

const port = 9331;
const host = 'localhost';
const server = express();
const staticMiddleware = express.static(modulesDir);
let moduleFiles = [];

server.use('/modules', () => (req, res, next) => {
  if (moduleFiles.includes(normalize(req.path))) {
    return staticMiddleware(req, res, next);
  } else {
    return next();
  }
});

server.listen(port, host, () => {
  log.info(`File server listening on port ${port}!`);
});

export function getDomain() {
  return `http://localhost:${port}`;
}

export function serveModuleFiles(files) {
  moduleFiles =
    files &&
    files.map(file => {
      let filePath = normalize(file);
      if (!filePath.startsWith('/') && !filePath.startsWith('\\')) {
        filePath = normalize('/' + filePath);
      }
      return filePath;
    });
}
