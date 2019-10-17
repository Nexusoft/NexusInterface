import React from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/core';

const spinning = keyframes`
  0% { transform: rotate(0deg) }  
  100% { transform: rotate(360deg) }
`;

const SpinnerComponent = styled.div({
  display: 'inline-block',
  position: 'relative',
  width: '1em',
  height: '1em',
  verticalAlign: 'middle',
});

const SpinnerPart = styled.div(({ index = 0, thickness }) => ({
  position: 'absolute',
  width: '100%',
  height: '100%',
  border: `${thickness}em solid transparent`,
  borderTopColor: 'currentColor',
  borderRadius: '50%',
  animation: `${spinning} 1s cubic-bezier(0.5, 0, 0.5, 1) infinite`,
  animationDelay: `-${0.1 * index}s`,
}));

const Spinner = ({ thickness = 0.1, ...rest }) => (
  <SpinnerComponent {...rest}>
    <SpinnerPart index={0} thickness={thickness} />
    <SpinnerPart index={1} thickness={thickness} />
    <SpinnerPart index={2} thickness={thickness} />
    <SpinnerPart index={3} thickness={thickness} />
  </SpinnerComponent>
);

export default Spinner;
