import React from 'react';
import Panel from 'components/Panel';
import ModuleIcon from 'components/ModuleIcon';
import WebView from './WebView';

const PageModule = ({ module }) => (
  <Panel
    title={
      <>
        <ModuleIcon module={module} className="space-right" />
        <span className="v-align">{module.displayName}</span>
      </>
    }
  >
    <WebView
      /* Set key attribute here so that the WebView instance will be reset and 
      componentDidMount will be called when it navigates to another module of the same type */
      key={module.name}
      module={module}
      style={{ width: '100%', height: '100%' }}
    />
  </Panel>
);

export default PageModule;
