import styled from '@emotion/styled';
import Icon from 'components/Icon';

const StatusIconWrapper = styled.div({
  position: 'relative',
  padding: '0 7px',
});

const StatusIcon = styled(Icon)({
  fontSize: 20,
});

StatusIcon.Wrapper = StatusIconWrapper;

export default StatusIcon;
