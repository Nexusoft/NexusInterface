// External
import { useQuery } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';
import styled from '@emotion/styled';

// Internal
import memoize from 'utils/memoize';
import { type Module as ModuleType, modulesMapAtom } from 'lib/modules';
import Module from './Module';
import SectionSeparator from './SectionSeparator';

__ = __context('Settings.Modules');

const FeaturedModuleList = styled.div({
  opacity: 0.7,
});

const getNotInstalled = memoize(
  (featuredModules: any[], modulesMap: Record<string, ModuleType>) =>
    featuredModules?.filter((m) => !modulesMap?.[m.name])
);

export default function FeaturedModules() {
  const modulesMap = useAtomValue(modulesMapAtom);
  const { data: featuredModules = [] } = useQuery({
    queryKey: ['featuredModules'],
    queryFn: async () =>
      (await window.nexusElectron.modules.getFeatured()) as any[],
    staleTime: 3600000, // 1 hour
  });
  const notInstalledFeaturedModules = getNotInstalled(
    featuredModules,
    modulesMap
  );

  return (
    !!notInstalledFeaturedModules?.length && (
      <>
        <SectionSeparator label={__('Developed by Nexus')} />
        <FeaturedModuleList>
          {notInstalledFeaturedModules.map((featuredModule) => (
            <Module.FeaturedModule
              key={featuredModule.name}
              featuredModule={featuredModule}
            />
          ))}
        </FeaturedModuleList>
      </>
    )
  );
}
