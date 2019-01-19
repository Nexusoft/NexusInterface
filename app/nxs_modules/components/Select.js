// External Dependencies
import React, { Component } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/core';

// Internal Dependencies
import Button from 'components/Button';
import Arrow from 'components/Arrow';
import Overlay from 'components/Overlay';
import Tooltip from 'components/Tooltip';
import { timing, consts, animations } from 'styles';
import { color } from 'utils';

// Minimum gap from the dropdown to the bottom edge of the screen
const minScreenGap = 20;
// Options's horizontal padding
const optionHPadding = 12;

const ErrorMessage = styled(Tooltip)({
  position: 'absolute',
  top: 'calc(100% + 10px)',
  left: 0,
  maxWidth: '100%',
  opacity: 0,
  visibility: 'hidden',
  transition: `opacity ${timing.normal}, visibility ${timing.normal}`,
  zIndex: 1,
  whiteSpace: 'normal',
  textAlign: 'left',
});

const SelectControl = styled.div(
  {
    display: 'flex',
    alignItems: 'stretch',
    cursor: 'pointer',
    height: consts.inputHeightEm + 'em',
    position: 'relative',

    '&:hover': {
      [ErrorMessage]: {
        opacity: 1,
        visibility: 'visible',
      },
    },
  },

  ({ skin, active, theme, error }) => {
    switch (skin) {
      case 'underline':
        return {
          background: 'transparent',
          color: theme.lighterGray,
          transitionProperty: 'color, border-bottom-color',
          transitionDuration: timing.normal,
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 2,
            borderRadius: 1,
            background: error ? theme.error : theme.gray,
            transitionProperty: 'background-color',
            transitionDuration: timing.normal,
          },
          '&:hover': {
            color: theme.light,
            borderBottomColor: theme.lightGray,
            '&::after': {
              background: theme.lightGray,
            },
          },
          ...(active
            ? {
                color: theme.light,
                '&&::after': {
                  background: error
                    ? color.lighten(theme.error, 0.3)
                    : color.lighten(theme.primary, 0.3),
                },
              }
            : null),
        };
      case 'filled-light':
        return {
          paddingLeft: '.8em',
          background: theme.lighterGray,
          color: theme.dark,
          borderRadius: 2,
          transition: `background-color ${timing.normal}`,
          '&:hover': {
            background: theme.light,
          },
          ...(active
            ? {
                background: theme.light,
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

const OptionsComponent = styled.div(
  {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 'auto',
    height: 'auto',
    visibility: 'hidden',
    overflowY: 'auto',
    borderRadius: 4,
    padding: '4px 0',
    margin: 0,
    boxShadow: `0 0 8px rgba(0,0,0,.7)`,
  },
  ({ skin, theme }) => {
    switch (skin) {
      case 'underline':
        return {
          background: theme.dark,
          color: theme.light,
        };
      case 'filled-light':
        return {
          background: theme.light,
          color: theme.dark,
        };
    }
  },
  ({ ready }) =>
    ready && {
      visibility: 'visible',
      animation: `${animations.fadeIn} ${timing.quick} ease-out`,
    }
);

const Option = styled.div(
  {
    display: 'flex',
    alignItems: 'center',
    padding: `0 ${optionHPadding}px`,
    overflow: 'hidden',
    cursor: 'pointer',
    transition: `background-color ${timing.normal}`,
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    height: consts.inputHeightEm + 'em',
  },
  ({ skin, selected, theme }) => {
    switch (skin) {
      case 'underline':
        return {
          background: selected ? theme.primary : undefined,
          color: selected ? theme.primaryContrast : undefined,
          '&:hover': {
            background: selected ? theme.primary : theme.darkerGray,
          },
        };
      case 'filled-light':
        return {
          '&:hover': {
            background: theme.lighterGray,
          },
        };
    }
  }
);

class Options extends Component {
  selectedRef = React.createRef();

  state = {
    ready: false,
    // Apply the same fon-size with the Select control
    styles: {
      fontSize: window
        .getComputedStyle(this.props.controlRef)
        .getPropertyValue('font-size'),
    },
  };

  positionDropdown = () => {
    if (!this.selectedRef.current) return;
    const styles = { fontSize: this.state.styles.fontSize };

    // Horizontally align Options dropdown with the Select control
    const controlRect = this.props.controlRef.getBoundingClientRect();
    if (this.props.skin === 'underline') {
      styles.left = controlRect.left - optionHPadding;
      styles.width = controlRect.width + optionHPadding;
    } else {
      styles.left = controlRect.left;
      styles.width = controlRect.width;
    }

    // Vertically align Selected Option with the Select control
    const thisRect = this.el.getBoundingClientRect();
    const selectedRect = this.selectedRef.current.getBoundingClientRect();
    const selectedOptTop = selectedRect.top - thisRect.top;
    styles.top = controlRect.top - selectedOptTop;

    styles.height = thisRect.height;

    // Prevent the Options dropdown to outreach the top of the screen
    if (styles.top < minScreenGap) {
      this.scrollTop = minScreenGap - styles.top;
      styles.height = styles.top + styles.height - minScreenGap;
      styles.top = minScreenGap;
    }

    // Prevent the Options dropdown to outreach the screen
    if (styles.top + styles.height > window.innerHeight - minScreenGap) {
      styles.height = window.innerHeight - minScreenGap - styles.top;
    }

    this.setState({ ready: true, styles });
  };

  select = option => {
    this.props.close();
    this.props.onChange(option.value);
  };

  render() {
    const { skin, options, close, onChange, value, ...rest } = this.props;
    const { ready, styles } = this.state;

    return (
      <Overlay onBackgroundClick={close} onMount={this.positionDropdown}>
        <OptionsComponent
          skin={skin}
          ref={el => {
            if (el && this.scrollTop) {
              el.scrollTop = this.scrollTop;
              this.scrollTop = null;
            }
            this.el = el;
          }}
          style={styles}
          ready={ready}
        >
          {options.map(option => (
            <Option
              key={option.value}
              skin={skin}
              onClick={() => this.select(option)}
              selected={option.value === value}
              ref={option.value === value ? this.selectedRef : undefined}
            >
              {option.display}
            </Option>
          ))}
        </OptionsComponent>
      </Overlay>
    );
  }
}

export default class Select extends Component {
  controlRef = React.createRef();

  state = { open: false };

  option = value => this.props.options.find(o => o.value === value);

  open = () => {
    this.setState({ open: true });
  };

  close = () => {
    this.setState({ open: false });
  };

  render() {
    const {
      skin = 'underline',
      options,
      value,
      error,
      onChange,
      ...rest
    } = this.props;
    const { open } = this.state;
    if (!options.length) {
      console.error('Select options cannot be empty');
      return null;
    }
    const selectedOption = this.option(value);
    if (!selectedOption) {
      console.error(
        `Selected value ${value} is not found among the options: ${options}`
      );
      return null;
    }

    return (
      <>
        <SelectControl
          ref={this.controlRef}
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
          {!!error && (
            <ErrorMessage skin="error" position="bottom" align="start">
              {error}
            </ErrorMessage>
          )}
        </SelectControl>

        {open && (
          <Options
            {...{ skin, options, value, onChange }}
            close={this.close}
            controlRef={this.controlRef.current}
          />
        )}
      </>
    );
  }
}

// Select wrapper for redux-form
const SelectReduxFForm = ({ input, meta, ...rest }) => (
  <Select error={meta.touched && meta.error} {...input} {...rest} />
);
Select.RF = SelectReduxFForm;
