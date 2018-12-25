import React from 'react';
import styled from '@emotion/styled';

const Svg = styled.svg(
  {
    fill: 'currentColor',
    stroke: 'currentColor',
    verticalAlign: 'middle',
    transitionProperty: 'fill, stroke',
    transitionDuration: '.2s',
    width: '1em',
    height: '1em',
  },
  ({ spaceRight }) =>
    spaceRight && {
      marginRight: '.4em',
    }
);

const Icon = ({ icon = {}, spaceRight, ...rest }) => (
  <Svg viewBox={icon.viewBox} spaceRight={spaceRight} {...rest}>
    <use xlinkHref={`#${icon.id}`} />
  </Svg>
);

export default Icon;
