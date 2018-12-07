// External Dependencies
import React from 'react'
import { FormattedMessage } from 'react-intl'

const DaemonStatus = ({ settings, connections, daemonAvailable }) => {
  if (settings.manualDaemon === false && connections === undefined) {
    return (
      <>
        <FormattedMessage
          id="Alert.DaemonLoadingWait"
          defaultMessage="Loading Daemon, Please wait"
        />
        ...
      </>
    )
  }
  if (settings.manualDaemon === true && daemonAvailable === false) {
    return (
      <FormattedMessage
        id="Alert.ManualDaemonDown"
        defaultMessage="Daemon Process Not Found"
      />
    )
  }

  return null
}

export default DaemonStatus
