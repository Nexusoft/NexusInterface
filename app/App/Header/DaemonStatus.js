// External Dependencies
import React from 'react';
import Text from 'components/Text';

const DaemonStatus = ({ settings, connections, daemonAvailable }) => {
  if (settings.manualDaemon === false && connections === undefined) {
    return (
      <span className="dim">
        <Text id="Alert.DaemonLoadingWait" />
        ...
      </span>
    );
  }
  if (settings.manualDaemon === true && daemonAvailable === false) {
    return (
      <span className="dim">
        <Text id="Alert.ManualDaemonDown" />
      </span>
    );
  }

  return null;
};

export default DaemonStatus;
