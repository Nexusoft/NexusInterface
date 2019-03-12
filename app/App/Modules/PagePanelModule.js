import React from 'react';
import Panel from 'components/Panel';
import legoBlockIcon from 'images/lego-block.sprite.svg';
import WebView from './WebView';

const PageModule = ({ module }) => (
  <Panel
    iconSrc={module.iconPath}
    iconSprite={!module.iconPath && legoBlockIcon}
    title={module.displayName || module.name}
  >
    <WebView module={module} style={{ width: '100%', height: '100%' }} />
  </Panel>
);

export default PageModule;
