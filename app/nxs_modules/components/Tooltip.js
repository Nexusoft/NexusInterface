// @jsx jsx

/**
 * Important note - This file is imported into module_preload.js, either directly or
 * indirectly, and will be a part of the preload script for modules, therefore:
 * - Be picky with importing stuffs into this file, especially for big
 * files and libraries. The bigger the preload scripts get, the slower the modules
 * will load.
 * - Don't assign anything to `global` variable because it will be passed
 * into modules' execution environment.
 * - Make sure this note also presents in other files which are imported here.
 */

// External
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import styled from '@emotion/styled';
import { jsx } from '@emotion/core';

// Internal
import { arrowStyles } from 'components/Arrow';
import { timing, animations, zIndex } from 'styles';
import * as color from 'utils/color';

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
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    maxWidth: 300,
    width: 'max-content',
    borderRadius: 4,
    boxShadow: '0 0 8px rgba(0,0,0,.7)',
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
          background: color.lighten(theme.background, 0.2),
          color: theme.foreground,
        };
      case 'error':
        return {
          background: theme.danger,
          color: theme.dangerAccent,
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
          ? color.lighten(theme.background, 0.2)
          : skin === 'error'
          ? theme.danger
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
  /**
   *Creates an instance of TooltipPortal.
   * @param {*} props
   * @memberof TooltipPortal
   */
  constructor(props) {
    super(props);
    this.el = document.createElement('div');
  }

  /**
   * Component Mount Callback
   *
   * @memberof TooltipPortal
   */
  componentDidMount() {
    document.getElementsByTagName('body')[0].appendChild(this.el);
  }

  /**
   * Component Unmount Callback
   *
   * @memberof TooltipPortal
   */
  componentWillUnmount() {
    document.getElementsByTagName('body')[0].removeChild(this.el);
  }

  /**
   * Component's Renderable JSX
   *
   * @returns
   * @memberof TooltipPortal
   */
  render() {
    return ReactDOM.createPortal(<Tooltip {...this.props} />, this.el);
  }
}

/**
 * Triggers the Tooltip
 *
 * @class TooltipTrigger
 * @extends {Component}
 */
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

  /**
   * Show the Tooltip
   *
   * @memberof TooltipTrigger
   */
  showTooltip = () => {
    const trigger = ReactDOM.findDOMNode(this);
    if (!trigger) return;

    const { position, align } = this.props;
    const rect = trigger.getBoundingClientRect();
    const tooltipStyles = {
      position: 'fixed',
      zIndex: zIndex.tooltips,
      ...tooltipPositioning(rect, position),
      ...tooltipAligning(rect, position, align),
    };

    this.setState({ active: true, tooltipStyles });
  };

  /**
   * Hide the Tooltip
   *
   * @memberof TooltipTrigger
   */
  hideTooltip = () => {
    this.setState({ active: false });
  };

  /**
   * Component's Renderable JSX
   *
   * @returns
   * @memberof TooltipTrigger
   */
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
