// @jsx jsx
import React, { Component } from 'react';
import styled from '@emotion/styled';
import { jsx, css } from '@emotion/core';
import Button from 'components/Button';
import Icon from 'components/Icon';
import { colors, timing, consts } from 'styles';
import { lighten, fade } from 'utils/colors';

const inputHeightHalf = '1.125em';
const iconSpace = '3em';

const InputWrapper = styled.div(
  {
    position: 'relative',
    height: consts.inputHeightEm + 'em',
    alignItems: 'center',
  },

  ({ size }) => ({
    display: size ? 'inline-flex' : 'flex',
  }),

  ({ focus }) => ({ skin, focus }) => {
    switch (skin) {
      case 'underline':
        return {
          color: colors.lighterGray,
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
            background: colors.gray,
            transitionProperty: 'background-color, box-shadow',
            transitionDuration: timing.normal,
          },
          '&:hover': {
            color: colors.light,
            '&::after': {
              background: colors.lightGray,
            },
          },
          ...(focus
            ? {
                '&&::after': {
                  background: lighten(colors.primary, 0.3),
                  boxShadow: `0 0 15px ${colors.primary}`,
                },
              }
            : null),
        };
      case 'filled-light':
        return {
          borderRadius: 2,
          background: colors.lighterGray,
          color: colors.dark,
          transitionProperty: 'background-color',
          transitionDuration: timing.normal,
          '&:hover': {
            background: colors.light,
          },
          ...(focus
            ? {
                '&&::after': {
                  background: colors.light,
                },
              }
            : null),
        };
      case 'filled-dark':
        return {
          border: `1px solid ${colors.darkerGray}`,
          background: colors.dark,
          color: colors.light,
          borderRadius: 2,
          transitionProperty: 'border-color, box-shadow',
          transitionDuration: timing.normal,
          '&:hover': {
            borderColor: colors.darkGray,
          },
          ...(focus
            ? {
                '&, &:hover': {
                  borderColor: colors.primary,
                  boxShadow: `0 0 5px ${colors.primary}`,
                },
              }
            : null),
        };
    }
  }
);

const Input = styled.input(
  {
    display: 'block',
    background: 'transparent',
    color: 'inherit',
    padding: 0,
    height: '100%',
    transitionProperty: 'color, box-shadow, color',
    transitionDuration: timing.normal,

    '&::placeholder': {
      color: colors.gray,
    },

    '&[type="date"], &[type="time"]': {
      '&::-webkit-inner-spin-button': {
        position: 'relative',
        top: inputHeightHalf,
        transform: 'translateY(-50%)',
      },
    },
  },

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
      <InputWrapper
        {...{ className, style, skin, size }}
        focus={this.state.focus}
      >
        {left}
        <Input {...inputProps} />
        {right}
      </InputWrapper>
    );
  }
}
