import { createRoot } from 'react-dom/client';
import cssUrl from 'react-simple-keyboard/build/css/index.css';

import VirtualKeyboard from './VirtualKeyboard';

const linkEl = document.createElement('link');
linkEl.setAttribute('rel', 'stylesheet');
linkEl.setAttribute('type', 'text/css');
linkEl.setAttribute('href', cssUrl);
document.head.appendChild(linkEl);

const rootNode = document.getElementById('root');
const root = createRoot(rootNode);
root.render(<VirtualKeyboard />);
