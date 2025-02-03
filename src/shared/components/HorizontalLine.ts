import styled from '@emotion/styled';
import { consts, timing, animations } from 'styles';

const HorizontalLine = styled.div(({ theme }) => ({
  height: 2,
  margin: '0 auto',
  backgroundImage: `linear-gradient(to right, transparent 0%, transparent 20%, ${theme.primary} 50%, transparent 80%, transparent 100%)`,
  animation: `${animations.expand} ${timing.slow} ${consts.enhancedEaseOut}`,
}));

export default HorizontalLine;
