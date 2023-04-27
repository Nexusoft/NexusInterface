import { render } from 'react-dom';
import cssUrl from 'react-simple-keyboard/build/css/index.css';

import VirtualKeyboard from './VirtualKeyboard';

const linkEl = document.createElement('link');
linkEl.setAttribute('rel', 'stylesheet');
linkEl.setAttribute('type', 'text/css');
linkEl.setAttribute('href', cssUrl);
document.head.appendChild(linkEl);

render(<VirtualKeyboard />, document.getElementById('root'));
