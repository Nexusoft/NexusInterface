// External Dependencies
import React, { Component } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/core';

// Internal Dependencies
import Button from 'components/common/Button';
import Arrow from 'components/common/Arrow';
import Overlay from 'components/common/Overlay';
import { colors, timing } from 'styles';
import { start } from 'repl';

const defaultOptionHeight = '2.25em';
// Minimum gap from the dropdown to the bottom edge of the screen
const minScreenGap = 20;

const ComboBoxControl = styled.div(
  {
    display: 'flex',
    alignItems: 'stretch',
    backgroundColor: colors.lighterGray,
    color: colors.dark,
    borderRadius: 2,
    cursor: 'pointer',
    transition: `background-color ${timing.normal}`,

    '&:hover': {
      backgroundColor: colors.light,
    },
  },
  ({ opening }) =>
    opening && {
      backgroundColor: colors.light,
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
    },
  ({ optionHeight }) => ({
    height: optionHeight || defaultOptionHeight,
  })
);

const CurrentValue = styled.div({
  flexGrow: 1,
  flexBasis: 0,
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  paddingLeft: '.8em',
  whiteSpace: 'nowrap',
});

const ArrowButton = styled(Button)({
  paddingTop: 0,
  paddingBottom: 0,
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

const Options = styled.ul({
  position: 'absolute',
  overflowY: 'auto',
  backgroundColor: colors.light,
  padding: 0,
  margin: 0,
  transformOrigin: 'top',
  animation: `${vertExpand} ${timing.quick} ease-out`,
});

const Option = styled.li(
  {
    display: 'flex',
    alignItems: 'center',
    padding: '0 .8em',
    overflow: 'hidden',
    color: colors.dark,
    cursor: 'pointer',
    transition: `background-color ${timing.normal}`,
    whiteSpace: 'nowrap',

    '&:hover': {
      backgroundColor: colors.lighterGray,
    },
  },
  ({ optionHeight }) => ({
    height: optionHeight || defaultOptionHeight,
  })
);

export default class ComboBox extends Component {
  state = {
    open: false,
    // Options dropdown's size and position
    top: 0,
    left: 0,
    width: 200,
  };

  componentDidUpdate() {
    if (this.optionsRef) {
      const rect = this.optionsRef.getBoundingClientRect();
      // Due to the expand animation, the current element's size is only a part of of the full size
      // So we need to find the real bottom position when the element is in full size
      const fullSizeBottom = rect.top + rect.height * startingScaleDown;
      if (fullSizeBottom > window.innerHeight - minScreenGap) {
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
    const { options, optionHeight, value, onChange, ...rest } = this.props;
    const { open, top, left, width } = this.state;
    const selectedOption = this.option(value);

    return (
      <>
        <ComboBoxControl
          optionHeight={optionHeight}
          ref={el => (this.controlRef = el)}
          opening={open}
          onClick={this.open}
          {...rest}
        >
          <CurrentValue>
            {selectedOption ? selectedOption.display : null}
          </CurrentValue>
          <Button freeHeight blank dark>
            <Arrow down width={12} height={8} />
          </Button>
        </ComboBoxControl>

        {open && (
          <Overlay onBackgroundClick={this.close}>
            <Options
              ref={el => (this.optionsRef = el)}
              style={{ top, left, width }}
            >
              {options.map(option => (
                <Option
                  optionHeight={optionHeight}
                  key={option.value}
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
