// External
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAtomValue } from 'jotai';

// Internal Global
import UT from 'lib/usageTracking';
import { modulesMapAtom } from 'lib/modules';

// Internal Local
import AppModule from './AppModule';
import WrappedAppModule from './WrappedAppModule';

export default function Modules() {
  const { name } = useParams();
  const modulesMap = useAtomValue(modulesMapAtom);
  useEffect(() => {
    UT.SendScreen('Module');
  }, []);
  const module = modulesMap[name];
  if (!module || module.info.type !== 'app' || !module.enabled) return null;

  if (module.info.options && module.info.options.wrapInPanel) {
    return <WrappedAppModule module={module} />;
  } else {
    return <AppModule module={module} />;
  }
}
