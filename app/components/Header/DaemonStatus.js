// External Dependencies
import React from 'react'
import { FormattedMessage } from 'react-intl'

const DaemonStatus = ({ settings, connections, daemonAvailable }) => {
  if (settings.manualDaemon === false && connections === undefined) {
    return (
      <span>
        <FormattedMessage
          id="Alert.DaemonLoadingWait"
          defaultMessage="Loading Daemon, Please wait"
        />
        ...
      </span>
    )
  }
  if (settings.manualDaemon === true && daemonAvailable === false) {
    return (
      <span>
        <FormattedMessage
          id="Alert.ManualDaemonDown"
          defaultMessage="Daemon Process Not Found"
        />
      </span>
    )
  }

  return null
}

export default DaemonStatus
