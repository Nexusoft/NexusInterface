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

// External Dependencies
import React, { Component } from 'react';
import styled from '@emotion/styled';

// Internal Dependencies
import Button from 'components/Button';
import Arrow from 'components/Arrow';
import Overlay from 'components/Overlay';
import Tooltip from 'components/Tooltip';
import { timing, consts, animations } from 'styles';
import * as color from 'utils/color';
import { passRef } from 'utils/misc';

// Minimum gap from the dropdown to the edges of the screen
const minScreenGap = 10;
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
          color: theme.mixer(0.875),
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
            background: error ? theme.danger : theme.mixer(0.5),
            transitionProperty: 'background-color',
            transitionDuration: timing.normal,
          },
          '&:hover': {
            color: theme.foreground,
            borderBottomColor: theme.mixer(0.75),
            '&::after': {
              background: error
                ? color.lighten(theme.danger, 0.3)
                : theme.mixer(0.75),
            },
          },
          ...(active
            ? {
                color: theme.foreground,
                '&&::after': {
                  background: error
                    ? color.lighten(theme.danger, 0.3)
                    : color.lighten(theme.primary, 0.3),
                },
              }
            : null),
        };
      case 'filled':
        return {
          paddingLeft: '.8em',
          background: theme.mixer(0.875),
          color: theme.background,
          borderRadius: 2,
          transition: `background-color ${timing.normal}`,
          '&:hover': {
            background: theme.foreground,
          },
          ...(active
            ? {
                background: theme.foreground,
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

const Placeholder = styled.span(({ theme }) => ({
  color: theme.mixer(0.5),
}));

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
          background: theme.background,
          color: theme.foreground,
        };
      case 'filled':
        return {
          background: theme.foreground,
          color: theme.background,
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
          color: selected ? theme.primaryAccent : undefined,
          '&:hover': {
            background: selected ? theme.primary : theme.mixer(0.125),
          },
        };
      case 'filled':
        return {
          '&:hover': {
            background: theme.mixer(0.875),
          },
        };
    }
  }
);

class Options extends Component {
  anchorRef = React.createRef();

  state = {
    ready: false,
    // Apply the same font-size with the Select control
    styles: {
      fontSize: window
        .getComputedStyle(this.props.controlRef.current)
        .getPropertyValue('font-size'),
    },
  };

  componentDidMount() {
    this.positionDropdown();
  }

  positionDropdown = () => {
    if (!this.anchorRef.current) return;
    const styles = { fontSize: this.state.styles.fontSize };

    // Horizontally align Options dropdown with the Select control
    const controlRect = this.props.controlRef.current.getBoundingClientRect();
    if (this.props.skin === 'underline') {
      styles.left = controlRect.left - optionHPadding;
      styles.width = controlRect.width + optionHPadding;
    } else {
      styles.left = controlRect.left;
      styles.width = controlRect.width;
    }

    // Vertically align Selected Option with the Select control
    const thisRect = this.el.getBoundingClientRect();
    const selectedRect = this.anchorRef.current.getBoundingClientRect();
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
    if (!option.isDummy) {
      this.props.onChange(option.value);
    }
  };

  render() {
    const { skin, options, close, value } = this.props;
    const { ready, styles } = this.state;
    const selectedIndex = options.findIndex(o => o.value === value);
    const anchorIndex = selectedIndex !== -1 ? selectedIndex : 0;
    console.error(options);
    return (
      <Overlay onBackgroundClick={close}>
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
          {options.map((option, i) => (
            <Option
              key={option.isDummy ? i : option.value}
              skin={skin}
              onClick={
                !option.isSeparator ? () => this.select(option) : () => null
              }
              selected={option.value === value && !option.isDummy}
              ref={i === anchorIndex ? this.anchorRef : undefined}
            >
              {option.indent && <>&nbsp;&nbsp;</>} {option.display}
            </Option>
          ))}
        </OptionsComponent>
      </Overlay>
    );
  }
}

class Select extends Component {
  controlRef = React.createRef();

  state = { open: false };

  options = () => {
    const { options } = this.props;
    if (options && options.length > 0) {
      return options;
    } else {
      // Default options with a dummy option to make the UI render
      return [
        {
          isDummy: true,
        },
      ];
    }
  };

  option = value =>
    this.props.options && this.props.options.find(o => o.value === value);

  open = () => {
    this.setState({ open: true });
  };

  close = () => {
    this.setState({ open: false });
  };

  render() {
    const {
      skin = 'underline',
      value,
      error,
      onChange,
      placeholder,
      controlRef,
      ...rest
    } = this.props;
    const { open } = this.state;
    const selectedOption = this.option(value);

    return (
      <>
        <SelectControl
          ref={el => {
            passRef(el, this.controlRef);
            passRef(el, controlRef);
          }}
          active={open}
          onClick={this.open}
          skin={skin}
          error={error}
          {...rest}
        >
          <CurrentValue>
            {selectedOption ? (
              selectedOption.display
            ) : (
              <Placeholder>{placeholder}</Placeholder>
            )}
          </CurrentValue>
          <Button
            fitHeight
            skin={skin === 'filled' ? 'plain-inverted' : 'plain'}
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
            {...{ skin, value, onChange }}
            options={this.options()}
            close={this.close}
            controlRef={this.controlRef}
          />
        )}
      </>
    );
  }
}

const SelectWrapper = React.forwardRef((props, ref) => (
  <Select {...props} controlRef={ref} />
));

// Select wrapper for redux-form
const SelectReduxForm = ({ input, meta, ...rest }) => (
  <Select error={meta.touched && meta.error} {...input} {...rest} />
);

SelectWrapper.RF = SelectReduxForm;

export default SelectWrapper;
