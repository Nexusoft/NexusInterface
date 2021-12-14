// External
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouteMatch } from 'react-router-dom';

// Internal Global
import GA from 'lib/googleAnalytics';

// Internal Local
import AppModule from './AppModule';
import WrappedAppModule from './WrappedAppModule';

export default function Modules() {
  const match = useRouteMatch();
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
