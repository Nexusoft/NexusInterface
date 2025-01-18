// External
import { useQuery } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';
import styled from '@emotion/styled';
import axios from 'axios';

// Internal
import memoize from 'utils/memoize';
import { modulesMapAtom } from 'lib/modules';
import Module from './Module';
import SectionSeparator from './SectionSeparator';

__ = __context('Settings.Modules');

const FeaturedModuleList = styled.div({
  opacity: 0.7,
});

const getNotInstalled = memoize((featuredModules, modulesMap) =>
  featuredModules?.filter((m) => !modulesMap?.[m.name])
);

export default function FeaturedModules() {
  const modulesMap = useAtomValue(modulesMapAtom);
  const { data: res } = useQuery({
    queryKey: ['featuredModules'],
    queryFn: () =>
      axios.get(
        `https://nexus-featured-modules.netlify.app/featured-modules?wallet_version=${APP_VERSION}`
      ),
    staleTime: 3600000, // 1 hour
  });
  const featuredModules = res?.data;
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
