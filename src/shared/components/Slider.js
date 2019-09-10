import React from 'react';
import styled from '@emotion/styled';

import { timing } from 'styles';
import * as color from 'utils/color';

const SliderComponent = styled.input(({ theme }) => ({
  appearance: 'none',
  width: '100%',
  height: 4,
  borderRadius: 2,
  background: theme.mixer(0.5),
  cursor: 'pointer',
  opacity: 0.8,
  transition: `opacity ${timing.normal}`,

  '&:hover': {
    opacity: 1,
  },

  '&::-webkit-slider-thumb': {
    appearance: 'none',
    width: 25,
    height: 25,
    borderRadius: '50%',
    background: theme.primary,
    transition: `background-color ${timing.normal}`,

    '&:hover': {
      background: color.lighten(theme.primary, 0.15),
    },
  },
}));

const Slider = props => <SliderComponent type="range" {...props} />;

export default Slider;
