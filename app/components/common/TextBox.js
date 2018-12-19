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

const IconWrapper = styled.div({
  position: 'absolute',
  right: 0,
  top: '50%',
  transform: 'translateY(-50%)',
  height: inputHeight,
  width: iconSpace,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  color: colors.darkGray,
});

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

const WrappedTextBox = ({ icon, inputProps, ...rest }) => (
  <InputWrapper {...rest}>
    <TextInput {...inputProps} />
    {icon && (
      <IconWrapper>
        <Icon icon={icon} />
      </IconWrapper>
    )}
  </InputWrapper>
);

export default TextBox;

export { WrappedTextBox };
