// @jsx jsx
import React, { Component } from 'react';
import styled from '@emotion/styled';
import { jsx, css } from '@emotion/core';
import Tooltip from 'components/Tooltip';
import { timing, consts } from 'styles';
import { color } from 'utils';

const inputHeightHalf = '1.125em';

const ErrorMessage = styled(Tooltip)(
  {
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
  },
  ({ focus }) =>
    focus && {
      opacity: 1,
      visibility: 'visible',
    }
);

const TextFieldComponent = styled.div(
  {
    position: 'relative',
    height: consts.inputHeightEm + 'em',
    alignItems: 'center',

    '&:hover': {
      [ErrorMessage]: {
        opacity: 1,
        visibility: 'visible',
      },
    },
  },

  ({ size }) => ({
    display: size ? 'inline-flex' : 'flex',
  }),

  ({ skin, focus, error, theme }) => {
    switch (skin) {
      case 'underline':
        return {
          color: theme.mixer(0.875),
          transitionProperty: 'color',
          transitionDuration: timing.normal,
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 2,
            borderRadius: 1,
            background: error ? theme.danger : theme.mixer(0.5),
            transitionProperty: 'background-color, box-shadow',
            transitionDuration: timing.normal,
          },
          '&:hover': {
            color: theme.foreground,
            '&::after': {
              background: error
                ? color.lighten(theme.danger, 0.3)
                : theme.mixer(0.75),
            },
          },
          ...(focus
            ? {
                '&&::after': {
                  background: color.lighten(
                    error ? theme.danger : theme.primary,
                    0.3
                  ),
                  boxShadow: `0 0 15px ${error ? theme.danger : theme.primary}`,
                },
              }
            : null),
        };
      case 'filled-light':
        return {
          borderRadius: 2,
          background: theme.mixer(0.875),
          color: theme.background,
          transitionProperty: 'background-color',
          transitionDuration: timing.normal,
          '&:hover': {
            background: theme.foreground,
          },
          ...(focus
            ? {
                background: theme.foreground,
              }
            : null),
          ...(error
            ? {
                border: `1px solid ${theme.danger}`,
              }
            : null),
        };
      case 'filled-dark':
        return {
          border: `1px solid ${theme.mixer(0.125)}`,
          background: theme.background,
          color: theme.foreground,
          borderRadius: 2,
          transitionProperty: 'border-color, box-shadow',
          transitionDuration: timing.normal,
          '&:hover': {
            borderColor: theme.mixer(0.25),
          },
          ...(focus
            ? {
                '&, &:hover': {
                  borderColor: theme.primary,
                  boxShadow: `0 0 5px ${theme.primary}`,
                },
              }
            : null),
          ...(error
            ? {
                '&, &:hover': {
                  borderColor: theme.danger,
                  boxShadow: `0 0 5px ${theme.danger}`,
                },
              }
            : null),
        };
    }
  },

  ({ multiline }) =>
    multiline && {
      height: 'auto',
      minHeight: consts.inputHeightEm + 'em',
    }
);

const Input = styled.input(
  ({ theme }) => ({
    display: 'block',
    background: 'transparent',
    color: 'inherit',
    padding: 0,
    height: '100%',
    transitionProperty: 'color, box-shadow, color',
    transitionDuration: timing.normal,

    '&::placeholder': {
      color: theme.mixer(0.5),
    },

    '&[type="date"], &[type="time"]': {
      '&::-webkit-inner-spin-button': {
        position: 'relative',
        top: inputHeightHalf,
        transform: 'translateY(-50%)',
      },
    },
  }),

  ({ type }) =>
    type === 'number' && {
      paddingRight: '.2em',
    },

  ({ size }) =>
    !size && {
      width: '100%',
    },

  ({ grouped }) => {
    switch (grouped) {
      case 'left':
        return {
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
        };
      case 'right':
        return {
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
        };
      case 'top':
        return {
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
        };
      case 'bottom':
        return {
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
        };
    }
  },

  ({ skin }) =>
    (skin === 'filled-light' || skin === 'filled-dark') && {
      padding: '0 .8em',
    }
);

const multilineStyle = css({
  height: 'auto',
  width: '100%',
  paddingTop: '.4em',
  paddingBottom: '.5em',
});

const multilineProps = {
  as: 'textarea',
  css: multilineStyle,
};

class TextArea extends Component {
  componentDidUpdate() {
    const { scrollHeight } = this.inputElem;
    this.inputElem.style.height =
      (scrollHeight > 104 ? 104 : scrollHeight) + 'px';
  }

  inputRef = el => {
    this.inputElem = el;
    const { inputRef } = this.props;
    if (typeof inputRef === 'function') {
      inputRef(el);
    } else if (inputRef && typeof inputRef === 'object') {
      inputRef.current = el;
    }
  };

  render() {
    return (
      <Input
        ref={this.inputRef}
        as="textarea"
        css={multilineStyle}
        {...this.props}
      />
    );
  }
}

export default class TextField extends Component {
  state = {
    focus: false,
  };

  handleFocus = e => {
    this.setState({ focus: true });
    this.props.onFocus && this.props.onFocus(e);
  };

  handleBlur = e => {
    this.setState({ focus: false });
    this.props.onBlur && this.props.onBlur(e);
  };
  //
  render() {
    const {
      className,
      style,
      skin = 'underline',
      multiline,
      left,
      right,
      size,
      readOnly,
      inputRef,
      error,
      ...rest
    } = this.props;

    const inputProps = {
      skin,
      size,
      readOnly,
      ...rest,
      onFocus: this.handleFocus,
      onBlur: this.handleBlur,
    };

    return (
      <TextFieldComponent
        {...{ className, style, skin, size, error, multiline }}
        focus={!readOnly && this.state.focus}
      >
        {left}
        {multiline ? (
          <TextArea {...inputProps} inputRef={inputRef} />
        ) : (
          <Input {...inputProps} ref={inputRef} />
        )}
        {right}
        {!!error && (
          <ErrorMessage
            skin="error"
            position="bottom"
            align="start"
            focus={this.state.focus}
          >
            {error}
          </ErrorMessage>
        )}
      </TextFieldComponent>
    );
  }
}

// TextField wrapper for redux-form
const TextFieldReduxForm = ({ input, meta, ...rest }) => (
  <TextField error={meta.touched && meta.error} {...input} {...rest} />
);
TextField.RF = TextFieldReduxForm;
