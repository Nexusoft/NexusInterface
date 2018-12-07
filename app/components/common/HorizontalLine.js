import styled from 'react-emotion';
import { colors, consts, timing, animations } from 'styles';

const HorizontalLine = styled('div')(
  {
    height: 2,
    margin: '0 auto',
    backgroundImage: `-webkit-linear-gradient(left, transparent 0%, ${
      colors.primary
    } 50%, transparent 100%)`,
    animationName: animations.expand,
    animationDuration: timing.slow,
    animationTimingFunction: consts.enhancedEaseOut,
  },
  ({ width = '60%' }) => ({
    width,
  })
);

export default HorizontalLine;
