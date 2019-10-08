import configureStoreDev from './configureStoreDev';
import configureStoreProd from './configureStoreProd';

export default process.env.NODE_ENV === 'production'
  ? configureStoreProd
  : configureStoreDev;
