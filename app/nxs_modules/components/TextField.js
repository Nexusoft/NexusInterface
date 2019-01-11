// @jsx jsx
import React, { Component } from 'react';
import styled from '@emotion/styled';
import { jsx, css } from '@emotion/core';
import Button from 'components/Button';
import Icon from 'components/Icon';
import { timing, consts } from 'styles';
import { color } from 'utils';

const inputHeightHalf = '1.125em';
const iconSpace = '3em';

const TextFieldComponent = styled.div(
  {
    position: 'relative',
    height: consts.inputHeightEm + 'em',
    alignItems: 'center',
  },

  ({ size }) => ({
    display: size ? 'inline-flex' : 'flex',
  }),

  ({ skin, focus, theme }) => {
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
            background: theme.gray,
            transitionProperty: 'background-color, box-shadow',
            transitionDuration: timing.normal,
          },
          '&:hover': {
            color: theme.light,
            '&::after': {
              background: theme.lightGray,
            },
          },
          ...(focus
            ? {
                '&&::after': {
                  background: color.lighten(theme.primary, 0.3),
                  boxShadow: `0 0 15px ${theme.primary}`,
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
                '&&::after': {
                  background: theme.light,
                },
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

export default class TextField extends Component {
  state = {
    focus: false,
  };
  inputReference = null;

  render() {
    const {
      className,
      style,
      skin = 'underline',
      multiline,
      left,
      right,
      size,
      ...rest
    } = this.props;

    const inputProps = {
      skin,
      size,
      onFocus: () => this.setState({ focus: true }),
      onBlur: () => this.setState({ focus: false }),
      ...(multiline
        ? {
            as: 'textarea',
            css: multilineStyle,
          }
        : null),
      ...rest,
    };

    return (
      <TextFieldComponent
        {...{ className, style, skin, size }}
       focus={this.state.focus}
      >
        {left}
        <Input {...inputProps} ref = {element => (this.inputReference = element)} />
        {right}
      </TextFieldComponent>
    );
  }
}
