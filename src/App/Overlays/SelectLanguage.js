import React from 'react';

import Button from 'components/Button';

import FullScreen from './FullScreen';

const SelectLanguage = ({}) => (
  <FullScreen
    header={__('Language')}
    footer={<Button skin="primary">Select</Button>}
  />
);

export default SelectLanguage;
