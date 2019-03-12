import React from 'react';
import styled from '@emotion/styled';

const Svg = styled.svg({
  fill: 'currentColor',
  stroke: 'currentColor',
  verticalAlign: 'middle',
  transitionProperty: 'fill, stroke',
  transitionDuration: '.2s',
  width: '1em',
  height: '1em',
});

const Icon = ({ icon = {}, spaceLeft, spaceRight, ...rest }) => (
  <Svg
    viewBox={icon.viewBox}
    className={`${spaceLeft ? 'space-left' : ''} ${
      spaceRight ? 'space-right' : ''
    }`}
    {...rest}
  >
    <use xlinkHref={`#${icon.id}`} />
  </Svg>
);

export default Icon;
