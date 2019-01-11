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
          color: theme.lighterGray,
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
            background: error ? theme.error : theme.gray,
            transitionProperty: 'background-color, box-shadow',
            transitionDuration: timing.normal,
          },
          '&:hover': {
            color: theme.light,
            '&::after': {
              background: error
                ? color.lighten(theme.error, 0.3)
                : theme.lightGray,
            },
          },
          ...(focus
            ? {
                '&&::after': {
                  background: color.lighten(
                    error ? theme.error : theme.primary,
                    0.3
                  ),
                  boxShadow: `0 0 15px ${error ? theme.error : theme.primary}`,
                },
              }
            : null),
        };
      case 'filled-light':
        return {
          borderRadius: 2,
          background: theme.lighterGray,
          color: theme.dark,
          transitionProperty: 'background-color',
          transitionDuration: timing.normal,
          '&:hover': {
            background: theme.light,
          },
          ...(focus
            ? {
                background: theme.light,
              }
            : null),
          ...(error
            ? {
                border: `1px solid ${theme.error}`,
              }
            : null),
        };
      case 'filled-dark':
        return {
          border: `1px solid ${theme.darkerGray}`,
          background: theme.dark,
          color: theme.light,
          borderRadius: 2,
          transitionProperty: 'border-color, box-shadow',
          transitionDuration: timing.normal,
          '&:hover': {
            borderColor: theme.darkGray,
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
                  borderColor: theme.error,
                  boxShadow: `0 0 5px ${theme.error}`,
                },
              }
            : null),
        };
    }
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
      color: theme.gray,
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
      error,
      ...rest
    } = this.props;

    const inputProps = {
      skin,
      size,
      readOnly,
      ...(multiline ? multilineProps : null),
      ...rest,
      onFocus: this.handleFocus,
      onBlur: this.handleBlur,
    };

    return (
      <TextFieldComponent
        {...{ className, style, skin, size, error }}
        focus={!readOnly && this.state.focus}
      >
        {left}
        <Input {...inputProps} />
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
const TextFieldReduxFForm = ({ input, meta, ...rest }) => (
  <TextField error={meta.touched && meta.error} {...input} {...rest} />
);

TextField.RF = TextFieldReduxFForm;
