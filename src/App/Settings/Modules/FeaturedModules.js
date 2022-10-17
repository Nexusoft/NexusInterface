// External
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import styled from '@emotion/styled';
import axios from 'axios';

// Internal
import store from 'store';
import * as TYPE from 'consts/actionTypes';

import Module from './Module';
import SectionSeparator from './SectionSeparator';

__ = __context('Settings.Modules');

const FeaturedModuleList = styled.div({
  opacity: 0.7,
});

const retryTime = 1000 * 60 * 60 * 6;
async function loadFeaturedModules() {
  try {
    const { featuredModules } = store.getState();
    if (featuredModules) return;

    const { data } = await axios.get(
      `https://nexus-featured-modules.netlify.app/featured-modules?wallet_version=${APP_VERSION}`
    );
    store.dispatch({
      type: TYPE.LOAD_FEATURED_MODULES,
      payload: data,
    });
  } catch (err) {
    setTimeout(loadFeaturedModules, retryTime);
  }
}

export default function FeaturedModules() {
  const modules = useSelector((state) => state.modules);
  const featuredModules = useSelector((state) => state.featuredModules);
  const notInstalledFeaturedModules = featuredModules?.filter(
    (m) => !modules?.[m.name]
  );

  useEffect(() => {
    loadFeaturedModules();
  }, []);

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
