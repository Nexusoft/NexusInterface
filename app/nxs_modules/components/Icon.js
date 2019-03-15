import React from 'react';
import styled from '@emotion/styled';

const Svg = styled.svg({
  verticalAlign: 'middle',
  transitionProperty: 'fill, stroke',
  transitionDuration: '.2s',
  width: '1em',
  height: '1em',
});

const Icon = ({ icon = {}, ...rest }) => (
  <Svg viewBox={icon.viewBox} {...rest}>
    <use href={`${icon.url ? icon.url : ''}#${icon.id}`} />
  </Svg>
);

export default Icon;
