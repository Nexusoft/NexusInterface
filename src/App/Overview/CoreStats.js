// External
import { useSelector } from 'react-redux';

// Internal
import { formatNumber, formatRelativeTime } from 'lib/intl';
import { useCoreInfo } from 'lib/coreInfo';

// Images
import Connections0 from 'icons/Connections0.svg';
import Connections4 from 'icons/Connections4.svg';
import Connections8 from 'icons/Connections8.svg';
import Connections12 from 'icons/Connections12.svg';
import Connections14 from 'icons/Connections14.svg';
import Connections16 from 'icons/Connections16.svg';
import nxsblocksIcon from 'icons/blockexplorer-invert-white.svg';

import Stat from './Stat';

__ = __context('Overview');

function getConnectionsIcon(conn) {
  if (conn > 4 && conn <= 6) {
    return Connections4;
  } else if (conn > 6 && conn <= 12) {
    return Connections8;
  } else if (conn > 12 && conn <= 14) {
    return Connections12;
  } else if (conn > 14 && conn <= 15) {
    return Connections14;
  } else if (conn > 15) {
    return Connections16;
  } else {
    return Connections0;
  }
}

export function ConnectionsStat() {
  const coreInfo = useCoreInfo();
  const connections = coreInfo?.connections;
  return (
    <Stat label={__('Connections')} icon={getConnectionsIcon(connections)}>
      {typeof connections === 'number' ? connections : 'N/A'}
    </Stat>
  );
}

export function BlockCountStat() {
  const coreInfo = useCoreInfo();
  const blocks = coreInfo?.blocks;
  const blockDate = useSelector((state) => state.common.blockDate);

  return (
    <Stat
      tooltipPosition="left"
      tooltip={
        !!blockDate && (
          <div style={{ textAlign: 'center' }}>
            {__('Last updated\n%{time}', {
              time: blockDate && formatRelativeTime(blockDate),
            })}
          </div>
        )
      }
      label={__('Block Count')}
      icon={nxsblocksIcon}
    >
      {typeof blocks === 'number' ? formatNumber(blocks, 0) : 'N/A'}
    </Stat>
  );
}
