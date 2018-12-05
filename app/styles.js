import { css, keyframes } from 'react-emotion'

export const colors = {}
colors.primary = '#0ca4fb'
colors.dark = '#0b1517'
colors.light = '#e6e9eb'
colors.oppositePrimary = colors.light

export const consts = {
  enhancedEaseOut: 'cubic-bezier(0, .9, .9, 1)',
}

export const timing = {
  regular: '.2s',
  slow: '1s',
}

export const animations = {
  expand: keyframes`
    from { transform: scale(0.5, 1) }
    to { transform: scale(1, 1) }
  `,
  fadeInAndExpand: keyframes`
    from { 
      transform: scale(0.5);
      opacity: 0 
    }
    to { 
      transform: scale(1);
      opacity: 1
    }
  `,
  spin: keyframes`
    100% {
      transform: rotate(360deg);
    }
  `,
}
