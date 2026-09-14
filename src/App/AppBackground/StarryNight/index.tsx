///
/// Inspired by https://www.script-tutorials.com/night-sky-with-twinkling-stars/
///
// External Dependencies
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

// Internal Local Dependencies
import starImg from './stars.jpg';
import twinklingMask from './twinkling-mask.png';

const twinkling = keyframes`
  from { transform: translate(0, 0) }
  to { transform: translate(1000px, 0) }
`;

const Stars = styled.div({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: `transparent url(${starImg}) repeat top center`,
});

const Twinkling = styled.div({
  position: 'absolute',
  top: 0,
  left: -1000,
  right: 0,
  bottom: 0,
  background: `transparent url(${twinklingMask}) repeat top center`,
  animation: `${twinkling} 35s linear infinite`,
});

/**
 * Returns the Starry Night Sky Background
 *
 */
export default function StarrySky() {
  return (
    <Stars>
      <Twinkling />
    </Stars>
  );
}
