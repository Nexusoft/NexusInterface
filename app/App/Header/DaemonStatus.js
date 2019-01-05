// External Dependencies
import React from 'react';
import Text from 'components/Text';

const DaemonStatus = ({ settings, connections }) => {
  if (!settings.manualDaemon && connections === undefined) {
    return (
      <span className="dim">
        <Text id="Alert.DaemonLoadingWait" />
        ...
      </span>
    );
  }
  if (settings.manualDaemon && connections === undefined) {
    return (
      <span className="dim">
        <Text id="Alert.ManualDaemonDown" />
      </span>
    );
  }

  return null;
};

export default DaemonStatus;
