import styled from '@emotion/styled';

const Arrow = styled.span(
  {
    display: 'inline-block',
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderColor: 'transparent',
  },
  ({ up, width, height, color = 'currentColor' }) =>
    up && {
      borderBottomColor: color,
      borderBottomWidth: height,
      borderLeftWidth: width / 2,
      borderRightWidth: width / 2,
    },
  ({ down, width, height, color = 'currentColor' }) =>
    down && {
      borderTopColor: color,
      borderTopWidth: height,
      borderLeftWidth: width / 2,
      borderRightWidth: width / 2,
    },
  ({ left, width, height, color = 'currentColor' }) =>
    left && {
      borderRightColor: color,
      borderRightWidth: height,
      borderTopWidth: width / 2,
      borderBottomWidth: width / 2,
    },
  ({ right, width, height, color = 'currentColor' }) =>
    right && {
      borderLeftColor: color,
      borderLeftWidth: height,
      borderTopWidth: width / 2,
      borderBottomWidth: width / 2,
    }
);

export default Arrow;
