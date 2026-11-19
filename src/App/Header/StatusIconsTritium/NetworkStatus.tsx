import Tooltip from 'components/Tooltip';
import Icon from 'components/Icon';
import { useTestnetIndicator, testnetColor } from 'lib/testnetIndicator';
import coreIcon from 'icons/core.svg';

import StatusIcon from './StatusIcon';

__ = __context('Header');

export default function NetworkStatus() {
  const indicator = useTestnetIndicator();
  if (!indicator.show('icon')) return null;
  return (
    <Tooltip.Trigger tooltip={indicator.label}>
      <StatusIcon style={{ color: testnetColor }}>
        <Icon icon={coreIcon} />
      </StatusIcon>
    </Tooltip.Trigger>
  );
}
