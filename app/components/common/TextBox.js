// @jsx jsx
import React from 'react';
import styled from '@emotion/styled';
import { jsx, css } from '@emotion/core';
import Button from 'components/common/Button';
import Icon from 'components/common/Icon';
import { colors, timing } from 'styles';
import { lighten, fade } from 'utils/colors';

const inputHeight = '2.25em';
const iconSpace = '3em';

const TextInput = styled.input(
  {
    display: 'block',
    backgroundColor: colors.lighterGray,
    color: colors.dark,
    borderRadius: 2,
    border: 'none',
    outline: 'none',
    padding: '0 .8em',
    height: inputHeight,
    width: '100%',
    transitionProperty: 'background-color',
    transitionDuration: timing.normal,

    '&::placeholder': {
      color: colors.gray,
    },

    '&:hover, &:focus': {
      backgroundColor: colors.light,
      color: colors.dark, // override old style
      outline: 'none',
    },
  },
  ({ padLeft }) =>
    padLeft && {
      paddingLeft: iconSpace,
    },
  ({ padRight }) =>
    padRight && {
      paddingRight: iconSpace,
    }
);

const InputWrapper = styled.div({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
});

const IconWrapper = styled.div(
  {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    height: inputHeight,
    width: iconSpace,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: colors.darkGray,
  },
  ({ head }) =>
    head && {
      left: 0,
    },
  ({ tail }) =>
    tail && {
      right: 0,
    }
);

const multilineStyle = css({
  height: 'auto',
  width: '100%',
  paddingTop: '.4em',
  paddingBottom: '.5em',
});

const TextBox = ({ multiline, ...rest }) =>
  multiline ? (
    <TextInput as="textarea" css={multilineStyle} {...rest} />
  ) : (
    <TextInput {...rest} />
  );

const WrappedTextBox = ({ headIcon, tailIcon, inputProps, ...rest }) => (
  <InputWrapper {...rest}>
    {headIcon && (
      <IconWrapper head>
        <Icon icon={headIcon} />
      </IconWrapper>
    )}
    <TextInput padLeft={!!headIcon} padRight={!!tailIcon} {...inputProps} />
    {tailIcon && (
      <IconWrapper tail>
        <Icon icon={tailIcon} />
      </IconWrapper>
    )}
  </InputWrapper>
);

export default TextBox;

export { WrappedTextBox };
