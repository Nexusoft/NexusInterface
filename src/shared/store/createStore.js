import createStoreDev from './createStoreDev';
import createStoreProd from './createStoreProd';

export default process.env.NODE_ENV === 'production'
  ? createStoreProd
  : createStoreDev;
