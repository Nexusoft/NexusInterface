// External Dependencies
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import styled from '@emotion/styled';

const OverlayWrapper = styled.div({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 9000,
});

const OverlayBackground = styled.div(
  {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  ({ dimmed }) =>
    dimmed && {
      backgroundColor: rgba(0, 0, 0, 0.5),
    }
);

export default class Overlay extends Component {
  constructor(props) {
    super(props);
    this.el = document.createElement('div');
  }

  componentDidMount() {
    document.getElementsByTagName('body')[0].appendChild(this.el);
  }

  componentWillUnmount() {
    document.getElementsByTagName('body')[0].removeChild(this.el);
  }

  render() {
    const { dimBackground, onBackgroundClick, children } = this.props;
    return ReactDOM.createPortal(
      <OverlayWrapper>
        <OverlayBackground dimmed={dimBackground} onClick={onBackgroundClick} />
        {this.props.children}
      </OverlayWrapper>,
      this.el
    );
  }
}
