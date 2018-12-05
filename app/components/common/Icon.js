import React from 'react'
import styled from 'react-emotion'

const Svg = styled('svg')({
  fill: 'currentColor',
  stroke: 'currentColor',
  verticalAlign: 'middle',
  transitionProperty: 'fill, stroke',
  transitionDuration: '.2s',
})

const Icon = ({ icon, ...rest }) => (
  <Svg viewBox={icon.viewBox} {...rest}>
    <use xlinkHref={`#${icon.id}`} />
  </Svg>
)

export default Icon
