/**
 *
 * Express server serving static files for modules
 *
 */
import { normalize } from 'path';
import express from 'express';
import config from 'api/configuration';

class FileServer {
  port = 9331;
  staticMiddleware = express.static(config.GetModulesDir());
  server = null;
  moduleFiles = [];

  get domain() {
    return `http://localhost:${this.port}`;
  }

  get moduleMiddleware() {
    return (req, res, next) => {
      if (this.moduleFiles.includes(normalize(req.path))) {
        return this.staticMiddleware(req, res, next);
      } else {
        return next();
      }
    };
  }

  constructor() {
    this.server = express();
    this.server.use('/modules', this.moduleMiddleware);
    this.server.listen(this.port, () => {
      console.log(`File server listening on port ${this.port}!`);
    });
  }

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
