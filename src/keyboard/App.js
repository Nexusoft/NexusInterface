import React from 'react';
import Keyboard from 'react-simple-keyboard';

import GlobalStyles from 'components/GlobalStyles';

const App = () => (
  <div>
    <GlobalStyles />
    <div>
      <input defaultValue="Enter something here" />
    </div>
    <Keyboard />
  </div>
);

export default App;
