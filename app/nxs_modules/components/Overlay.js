// External Dependencies
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import styled from '@emotion/styled';

import { animations, timing } from 'styles';

const OverlayComponent = styled.div({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 9000,
});

const OverlayBackground = styled.div(
  {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    animation: `${animations.fadeIn} ${timing.quick} ease-out`,
    animationFillMode: 'both',
  },
  ({ dimmed }) =>
    dimmed && {
      background: 'rgba(0,0,0,0.5)',
    }
);

export default class Overlay extends Component {
  node = document.createElement('div');

  componentDidMount() {
    document.getElementsByTagName('body')[0].appendChild(this.node);
    this.props.onMount && this.props.onMount();
  }

  componentWillUnmount() {
    document.getElementsByTagName('body')[0].removeChild(this.node);
  }

  render() {
    const {
      dimBackground,
      onBackgroundClick,
      backgroundRef,
      onMount,
      children,
      ...rest
    } = this.props;
    return ReactDOM.createPortal(
      <OverlayComponent {...rest}>
        <OverlayBackground
          ref={backgroundRef}
          dimmed={dimBackground}
          onClick={onBackgroundClick}
        />
        {children}
      </OverlayComponent>,
      this.node
    );
  }
}
