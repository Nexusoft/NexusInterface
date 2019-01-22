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
  ({ spaceLeft }) =>
    spaceLeft && {
      marginLeft: '.4em',
    },
  ({ spaceRight }) =>
    spaceRight && {
      marginRight: '.4em',
    }
);

const Icon = ({ icon = {}, spaceLeft, spaceRight, ...rest }) => (
  <Svg
    viewBox={icon.viewBox}
    spaceLeft={spaceLeft}
    spaceRight={spaceRight}
    {...rest}
  >
    <use xlinkHref={`#${icon.id}`} />
  </Svg>
);

export default Icon;
