// @jsx jsx
// External
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import styled from '@emotion/styled';
import { jsx } from '@emotion/core';

// Internal
import { arrowStyles } from 'components/Arrow';
import { timing, animations } from 'styles';
import { color } from 'utils';

const spacing = 10;
const arrowPadding = 15;
const positionToArrowDirection = {
  top: 'down',
  bottom: 'up',
  left: 'right',
  right: 'left',
};

const tooltipPositioning = (rect, position) => {
  switch (position) {
    case 'top':
      return { bottom: window.innerHeight + spacing - rect.top };
    case 'bottom':
      return { top: rect.bottom + spacing };
    case 'left':
      return { right: window.innerWidth + spacing - rect.left };
    case 'right':
      return { left: rect.right + spacing };
  }
};

const tooltipAligning = (rect, position, align) => {
  if (position === 'top' || position === 'bottom') {
    switch (align) {
      case 'start':
        return { left: rect.left };
      case 'end':
        return { right: window.innerWidth - rect.right };
      case 'center':
        return {
          left: (rect.left + rect.right) / 2,
          transform: 'translateX(-50%)',
        };
    }
  } else if (position === 'left' || position === 'right') {
    switch (align) {
      case 'start':
        return { top: rect.top };
      case 'end':
        return { bottom: window.innerHeight - rect.bottom };
      case 'center':
        return {
          top: (rect.top + rect.bottom) / 2,
          transform: 'translateY(-50%)',
        };
    }
  }
};

const arrowPositioning = position => ({ [position]: '100%' });

const arrowAligning = (position, align) => {
  if (position === 'top' || position == 'bottom') {
    switch (align) {
      case 'start':
        return { left: arrowPadding };
      case 'end':
        return { right: arrowPadding };
      case 'center':
        return { left: '50%', transform: 'translateX(-50%)' };
    }
  } else if (position === 'left' || position == 'right') {
    switch (align) {
      case 'start':
        return { top: arrowPadding };
      case 'end':
        return { bottom: arrowPadding };
      case 'center':
        return { top: '50%', transform: 'translateY(-50%)' };
    }
  }
};

const Tooltip = styled.div(
  {
    whiteSpace: 'pre',
    maxWidth: 300,
    borderRadius: 4,
    filter: 'drop-shadow(0 0 8px rgba(0,0,0,.7))',
    fontSize: 15,
    padding: '.4em .8em',
    animation: `${animations.fadeIn} ${timing.normal} ease-out`,
    '&::before': {
      content: '""',
      position: 'absolute',
    },
  },
  ({ skin, theme }) => {
    switch (skin) {
      case 'default':
        return {
          background: color.lighten(theme.dark, 0.2),
          color: theme.light,
        };
      case 'error':
        return {
          background: theme.error,
          color: theme.errorContrast,
        };
    }
  },
  ({ position }) =>
    (position === 'top' || position === 'bottom') && {
      textAlign: 'center',
    },
  ({ position, skin, theme }) => ({
    '&::before': arrowStyles({
      direction: positionToArrowDirection[position],
      width: 15,
      height: 8,
      color:
        skin === 'default'
          ? color.lighten(theme.dark, 0.2)
          : skin === 'error'
          ? theme.error
          : undefined,
    }),
  }),
  ({ position, align }) => ({
    '&::before': {
      ...arrowPositioning(position),
      ...arrowAligning(position, align),
    },
  })
);

class TooltipPortal extends Component {
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
    return ReactDOM.createPortal(<Tooltip {...this.props} />, this.el);
  }
}

class TooltipTrigger extends Component {
  static defaultProps = {
    position: 'bottom',
    align: 'center',
    skin: 'default',
  };

  state = {
    active: false,
    tooltipStyles: {},
  };

  showTooltip = () => {
    const trigger = ReactDOM.findDOMNode(this);
    if (!trigger) return;

    const { position, align } = this.props;
    const rect = trigger.getBoundingClientRect();
    const tooltipStyles = {
      position: 'fixed',
      zIndex: 9000,
      ...tooltipPositioning(rect, position),
      ...tooltipAligning(rect, position, align),
    };

    this.setState({ active: true, tooltipStyles });
  };

  hideTooltip = () => {
    this.setState({ active: false });
  };

  render() {
    const { children, tooltip, ...rest } = this.props;

    return (
      <>
        {React.cloneElement(React.Children.only(children), {
          onMouseEnter: this.showTooltip,
          onMouseLeave: this.hideTooltip,
        })}
        {!!tooltip && this.state.active && (
          <TooltipPortal css={this.state.tooltipStyles} {...rest}>
            {tooltip}
          </TooltipPortal>
        )}
      </>
    );
  }
}

Tooltip.Portal = TooltipPortal;
Tooltip.Trigger = TooltipTrigger;

export default Tooltip;
