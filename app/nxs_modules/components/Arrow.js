import styled from '@emotion/styled';

export const arrowStyles = ({ direction, width, height, color }) => {
  const styles = {
    display: 'block',
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderColor: 'transparent',
  };
  switch (direction) {
    case 'up':
      return {
        ...styles,
        borderBottomColor: color,
        borderBottomWidth: height,
        borderLeftWidth: width / 2,
        borderRightWidth: width / 2,
      };
    case 'down':
      return {
        ...styles,
        borderTopColor: color,
        borderTopWidth: height,
        borderLeftWidth: width / 2,
        borderRightWidth: width / 2,
      };
    case 'left':
      return {
        ...styles,
        borderRightColor: color,
        borderRightWidth: height,
        borderTopWidth: width / 2,
        borderBottomWidth: width / 2,
      };
    case 'right':
      return {
        ...styles,
        borderLeftColor: color,
        borderLeftWidth: height,
        borderTopWidth: width / 2,
        borderBottomWidth: width / 2,
      };
  }
  return styles;
};

const Arrow = styled.span(
  ({ direction, width, height, color = 'currentColor' }) =>
    arrowStyles({ direction, width, height, color })
);

export default Arrow;
