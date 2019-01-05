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
  },
  ({ dimmed }) =>
    dimmed && {
      background: 'rgba(0,0,0,0.5)',
    },
  ({ closing }) =>
    closing && {
      animation: `${animations.fadeOut} ${timing.quick} ease-out`,
    }
);

export default class Overlay extends Component {
  constructor(props) {
    super(props);
    this.el = document.createElement('div');
  }

  componentDidMount() {
    document.getElementsByTagName('body')[0].appendChild(this.el);
    this.props.onMount && this.props.onMount();
  }

  componentWillUnmount() {
    document.getElementsByTagName('body')[0].removeChild(this.el);
  }

  render() {
    const {
      dimBackground,
      onBackgroundClick,
      closing,
      children,
      ...rest
    } = this.props;
    return ReactDOM.createPortal(
      <OverlayComponent {...rest}>
        <OverlayBackground
          dimmed={dimBackground}
          onClick={onBackgroundClick}
          closing={closing}
        />
        {children}
      </OverlayComponent>,
      this.el
    );
  }
}
