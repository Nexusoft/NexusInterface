import { useRef, forwardRef, ComponentProps, ReactNode } from 'react';
import styled from '@emotion/styled';

import { timing } from 'styles';
import { refs } from 'utils/misc';

const SliderComponent = styled.input(({ theme }) => ({
  appearance: 'none',
  width: '100%',
  height: 4,
  margin: '15px 0',
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
      background: theme.raise(theme.primary, 0.15),
    },
  },
}));

const Slider = forwardRef<
  HTMLInputElement,
  ComponentProps<typeof SliderComponent> & {
    error?: ReactNode;
  }
>(({ error, ...rest }, ref) => {
  const sliderRef = useRef<HTMLInputElement>();
  return (
    <SliderComponent
      type="range"
      ref={refs(sliderRef, ref)}
      onMouseUp={() => {
        sliderRef.current?.blur();
      }}
      {...rest}
    />
  );
});

export default Slider;
