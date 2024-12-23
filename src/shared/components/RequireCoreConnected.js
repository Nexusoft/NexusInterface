import WaitingMessage from 'components/WaitingMessage';
import CoreStatus from 'components/CoreStatus';
import { useCoreConnected } from 'lib/coreInfo';

export default function RequireCoreConnected({ children }) {
  const coreConnected = useCoreConnected();
  return coreConnected ? (
    children
  ) : (
    <WaitingMessage>
      <CoreStatus />
    </WaitingMessage>
  );
}
