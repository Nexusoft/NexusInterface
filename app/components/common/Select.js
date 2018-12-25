// External Dependencies
import React, { Component } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/core';

// Internal Dependencies
import Button from 'components/common/Button';
import Arrow from 'components/common/Arrow';
import Overlay from 'components/common/Overlay';
import { colors, timing, consts } from 'styles';

// Minimum gap from the dropdown to the bottom edge of the screen
const minScreenGap = 20;

const SelectControl = styled.div(
  {
    display: 'flex',
    alignItems: 'stretch',
    cursor: 'pointer',
    height: consts.inputHeightEm + 'em',
  },

  ({ skin, active }) => {
    switch (skin) {
      case 'underline':
        return {
          background: 'transparent',
          color: colors.lighterGray,
          borderBottom: `2px solid ${colors.gray}`,
          transitionProperty: 'color, border-bottom-color',
          transitionDuration: timing.normal,
          '&:hover': {
            color: colors.light,
            borderBottomColor: colors.lightGray,
          },
          ...(active
            ? {
                color: colors.light,
                borderBottomColor: colors.primary,
              }
            : null),
        };
      case 'filled-light':
        return {
          paddingLeft: '.8em',
          background: colors.lighterGray,
          color: colors.dark,
          borderRadius: 2,
          transition: `background-color ${timing.normal}`,
          '&:hover': {
            background: colors.light,
          },
          ...(active
            ? {
                background: colors.light,
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
              }
            : null),
        };
    }
  }
);

const CurrentValue = styled.div({
  flexGrow: 1,
  flexBasis: 0,
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  whiteSpace: 'nowrap',
});

const startingScaleDown = 2;

const vertExpand = keyframes`
  0% {
    opacity: 0; 
    transform: scaleY(${1 / startingScaleDown});
  }
  100% {
    opacity: 1;
    transform: scaleY(1);
  }
`;

const Options = styled.div(
  {
    position: 'absolute',
    overflowY: 'auto',
    padding: 0,
    margin: 0,
    transformOrigin: 'top',
    animation: `${vertExpand} ${timing.quick} ease-out`,
    boxShadow: `0 0 8px rgba(0,0,0,.7)`,
  },
  ({ skin }) => {
    switch (skin) {
      case 'underline':
        return {
          background: colors.dark,
          color: colors.light,
        };
      case 'filled-light':
        return {
          background: colors.light,
          color: colors.dark,
        };
    }
  }
);

const Option = styled.div(
  {
    display: 'flex',
    alignItems: 'center',
    padding: '0 .8em',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: `background-color ${timing.normal}`,
    whiteSpace: 'nowrap',
    height: consts.inputHeightEm + 'em',
  },
  ({ skin }) => {
    switch (skin) {
      case 'underline':
        return {
          '&:hover': {
            background: colors.darkerGray,
          },
        };
      case 'filled-light':
        return {
          '&:hover': {
            background: colors.lighterGray,
          },
        };
    }
  }
);

export default class Select extends Component {
  state = {
    open: false,
    // Options dropdown's size and position
    top: 0,
    left: 0,
    width: 200,
  };

  componentDidUpdate() {
    // Prevent the Options dropdown to outreach the screen
    if (this.optionsRef) {
      const rect = this.optionsRef.getBoundingClientRect();
      // Due to the expand animation, the current element's size is only a part of of the full size
      // So we need to find the real bottom position when the element is in full size
      const fullSizeBottom = rect.top + rect.height * startingScaleDown;
      if (fullSizeBottom > window.innerHeight - minScreenGap) {
        // Manipulate the DOM directly so it won't waste another render cycle
        // and the maxHeight style doesn't affect other parts so it doesn't need to be in the state
        this.optionsRef.style.maxHeight =
          window.innerHeight - minScreenGap - rect.top + 'px';
      }
    }
  }

  option = value => this.props.options.find(o => o.value === value);

  open = () => {
    const {
      top,
      left,
      width,
      height,
    } = this.controlRef.getBoundingClientRect();
    this.setState({
      open: true,
      top: top + height,
      left,
      width,
    });
  };

  close = () => {
    this.setState({ open: false });
  };

  render() {
    const {
      skin = 'underline',
      options,
      value,
      onChange,
      ...rest
    } = this.props;
    const { open, top, left, width } = this.state;
    const selectedOption = this.option(value);

    return (
      <>
        <SelectControl
          ref={el => (this.controlRef = el)}
          active={open}
          onClick={this.open}
          skin={skin}
          {...rest}
        >
          <CurrentValue>
            {selectedOption ? selectedOption.display : null}
          </CurrentValue>
          <Button
            fitHeight
            skin={skin === 'filled-light' ? 'blank-dark' : 'blank-light'}
          >
            <Arrow direction="down" width={12} height={8} />
          </Button>
        </SelectControl>

        {open && (
          <Overlay onBackgroundClick={this.close}>
            <Options
              skin={skin}
              ref={el => (this.optionsRef = el)}
              style={{ top, left, width }}
            >
              {options.map(option => (
                <Option
                  key={option.value}
                  skin={skin}
                  onClick={() => {
                    this.close();
                    onChange(option.value);
                  }}
                >
                  {option.display}
                </Option>
              ))}
            </Options>
          </Overlay>
        )}
      </>
    );
  }
}
