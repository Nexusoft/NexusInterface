// External Dependencies
import React from 'react'
import styled from '@emotion/styled'
import { FormattedMessage } from 'react-intl'

// Internal Global Dependencies
import Icon from 'components/common/Icon'
import { animations } from 'styles'
import checkIcon from 'images/check.sprite.svg'
import syncingIcon from 'images/syncing.sprite.svg'

const SpinningIcon = styled(Icon)({
  animation: `${animations.spin} 2s linear infinite`,
})

function syncStatusTooltip({
  connections,
  daemonAvailable,
  heighestPeerBlock,
  blocks,
  messages,
  settings,
}) {
  if (connections === undefined || daemonAvailable === false) {
    return (
      <FormattedMessage
        id="Header.DaemonNotLoaded"
        defaultMessage="Daemon Not Loaded"
      />
    )
  } else {
    if (heighestPeerBlock > blocks) {
      return (
        messages[settings.locale]['Header.Synching'] +
        (heighestPeerBlock - blocks).toString() +
        messages[settings.locale]['Header.Blocks']
      )
    } else {
      return <FormattedMessage id="Header.Synched" defaultMessage="Synched" />
    }
  }
}

const SyncStatus = props => (
  <div className="icon">
    {props.heighestPeerBlock > props.blocks ? (
      <SpinningIcon icon={syncingIcon} />
    ) : (
      <Icon icon={checkIcon} />
    )}
    <div className="tooltip bottom" style={{ right: '100%' }}>
      <div>{syncStatusTooltip(props)}</div>
    </div>
  </div>
)

export default SyncStatus
