// External Dependencies
import React from 'react';
import styled from '@emotion/styled';

// Internal Local Dependencies
import lightImg from './Light_Space.jpg';

const LightBG = styled.div({
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `transparent url(${lightImg}) repeat top center`,
  });
  
  const CosmicLight = () => (
    <LightBG/>
  );
  
  export default CosmicLight;
  