/**
 *
 * Express server serving static files for modules
 *
 */
import { normalize } from 'path';
import express from 'express';
import log from 'electron-log';

import { modulesDir } from 'consts/paths';

/**
 * Express server serving static files for modules
 *
 * @class FileServer
 */
class FileServer {
  port = 9331;
  staticMiddleware = express.static(modulesDir);
  server = null;
  moduleFiles = [];

  /**
   * Get the domain where the module is
   *
   * @readonly
   * @memberof FileServer
   */
  get domain() {
    return `http://localhost:${this.port}`;
  }

  /**
   * Get the Module's Middleware
   *
   * @readonly
   * @memberof FileServer
   */
  get moduleMiddleware() {
    return (req, res, next) => {
      if (this.moduleFiles.includes(normalize(req.path))) {
        return this.staticMiddleware(req, res, next);
      } else {
        return next();
      }
    };
  }

  /**
   *Creates an instance of FileServer.
   * @memberof FileServer
   */
  constructor() {
    this.server = express();
    this.server.use('/modules', this.moduleMiddleware);
    this.server.listen(this.port, () => {
      log.info(`File server listening on port ${this.port}!`);
    });
  }

  /**
   * Serve the Module files to the client
   *
   * @memberof FileServer
   */
  serveModuleFiles = files => {
    this.moduleFiles =
      files &&
      files.map(file => {
        let filePath = normalize(file);
        if (!filePath.startsWith('/') && !filePath.startsWith('\\')) {
          filePath = normalize('/' + filePath);
        }
        return filePath;
      });
  };
}

export default new FileServer();
