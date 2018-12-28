import styled from '@emotion/styled';
import { consts, timing, animations } from 'styles';

const HorizontalLine = styled.div(({ theme }) => ({
  height: 2,
  margin: '0 auto',
  backgroundImage: `linear-gradient(to right, rgba(0,0,0,.5) 0%, rgba(0,0,0,.5) 20%, ${
    theme.primary
  } 50%, rgba(0,0,0,.5) 80%, rgba(0,0,0,.5) 100%)`,
  animation: `${animations.expand} ${timing.slow} ${consts.enhancedEaseOut}`,
}));

export default HorizontalLine;
