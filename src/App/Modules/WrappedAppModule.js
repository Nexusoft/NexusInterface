import Panel from 'components/Panel';
import ModuleIcon from 'components/ModuleIcon';
import WebView from './WebView';

export default function WrappedAppModule({ module }) {
  return (
    <Panel
      title={
        <>
          <ModuleIcon module={module} className="mr0_4" />
          <span className="v-align">{module.info.displayName}</span>
        </>
      }
    >
      <WebView
        /* Set key attribute here so that the WebView instance will be reset and 
      componentDidMount will be called when it navigates to another module of the same type */
        key={module.info.name}
        module={module}
        style={{ width: '100%', height: '100%' }}
      />
    </Panel>
  );
}
