import styled from '@emotion/styled';
import Icon from 'components/common/Icon';

export const StatusIconWrapper = styled.div({
  position: 'relative',
  padding: '0 7px',
});

export const StatusIcon = styled(Icon)({
  fontSize: 20,
});

export const StatusIconTooltip = styled.div({
  maxWidth: 240,
  whiteSpace: 'pre',
});
