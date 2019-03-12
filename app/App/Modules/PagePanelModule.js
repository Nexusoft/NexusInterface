import React from 'react';
import Panel from 'components/Panel';
import WebView from './WebView';

const PageModule = ({ module }) => (
  <Panel title={module.displayName || module.name}>
    <WebView module={module} style={{ width: '100%', height: '100%' }} />
  </Panel>
);

export default PageModule;
