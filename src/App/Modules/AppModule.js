import WebView from './WebView';

export default function AppModule({ module }) {
  return (
    <WebView
      /* Set key attribute here so that the WebView instance will be reset and 
      componentDidMount will be called when it navigates to another module of the same type */
      key={module.info.name}
      module={module}
      style={{ width: '100%', height: '100%' }}
    />
  );
}
