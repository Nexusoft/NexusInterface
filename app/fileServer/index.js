/**
 *
 * Express server serving static files for modules
 *
 */
import express from 'express';

class FileServer {
  port = 9331;
  server = null;
  staticMiddleware = null;

  get domain() {
    return `http://localhost:${this.port}`;
  }

  getStaticMiddleware = (() => {
    const middlewares = {};
    return path =>
      path
        ? middlewares[path] || (middlewares[path] = express.static(path))
        : null;
  })();

  get moduleMiddleware() {
    return (req, res, next) => {
      if (this.staticMiddleware) {
        return this.staticMiddleware(req, res, next);
      } else {
        return next();
      }
    };
  }

  constructor() {
    this.server = express();
    this.server.use('/module', this.moduleMiddleware);
    this.server.listen(this.port, () => {
      console.log(`File server listening on port ${this.port}!`);
    });
  }

  serveModuleFiles = path => {
    this.staticMiddleware = this.getStaticMiddleware(path);
  };
}

export default new FileServer();
