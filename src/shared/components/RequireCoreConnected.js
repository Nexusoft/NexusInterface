import { useSelector } from 'react-redux';

import WaitingMessage from 'components/WaitingMessage';
import CoreStatus from 'components/CoreStatus';
import { isCoreConnected } from 'selectors';

export default function RequireCoreConnected({ children }) {
  const coreConnected = useSelector(isCoreConnected);
  return coreConnected ? (
    children
  ) : (
    <WaitingMessage>
      <CoreStatus />
    </WaitingMessage>
  );
}
