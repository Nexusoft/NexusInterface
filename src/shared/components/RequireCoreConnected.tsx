import CoreStatus from 'components/CoreStatus';
import WaitingMessage from 'components/WaitingMessage';
import { useCoreConnected } from 'lib/coreInfo';
import { ReactNode } from 'react';

export default function RequireCoreConnected({
  children,
}: {
  children: ReactNode;
}) {
  const coreConnected = useCoreConnected();
  return coreConnected ? (
    children
  ) : (
    <WaitingMessage>
      <CoreStatus />
    </WaitingMessage>
  );
}
