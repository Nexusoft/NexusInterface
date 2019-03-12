import React from 'react';
import WebView from './WebView';

const PageModule = ({ module }) => (
  <WebView module={module} style={{ width: '100%', height: '100%' }} />
);

export default PageModule;
