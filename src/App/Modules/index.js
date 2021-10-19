// External
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

// Internal Global
import GA from 'lib/googleAnalytics';

// Internal Local
import AppModule from './AppModule';
import WrappedAppModule from './WrappedAppModule';

export default function Modules({ match }) {
  const modules = useSelector((state) => state.modules);
  useEffect(() => {
    GA.SendScreen('Module');
  }, []);
  const module = modules[match.params.name];
  if (!module || module.info.type !== 'app' || !module.enabled) return null;

  if (module.info.options && module.info.options.wrapInPanel) {
    return <WrappedAppModule module={module} />;
  } else {
    return <AppModule module={module} />;
  }
}
