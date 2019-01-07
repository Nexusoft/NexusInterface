// External Dependencies
import React, { Component } from 'react';
import Text from 'components/Text';
import Modal from 'react-responsive-modal';

// Internal Global Dependencies
import { GetSettings, SaveSettings } from 'api/settings';
import configuration from 'api/configuration';

var enoughSpace = true;

const modalOpen = ({
  manualDaemon,
  settings,
  connections,
  isInSync,
  BootstrapModal,
}) =>
  !manualDaemon &&
  ((settings.bootstrap && connections !== undefined && !isInSync) ||
    BootstrapModal);

class Prompting extends Component {
  render() {
    return (
      <>
        <h3>
          <Text id="ToolTip.DbOption" />
        </h3>
        {!enoughSpace && (
          <h3
            style={{
              color: '#ff0000',
            }}
          >
            <Text id="ToolTip.NotEnoughSpace" />
          </h3>
        )}
        <button
          className="button"
          disabled={!enoughSpace}
          onClick={() => {
            this.props.OpenBootstrapModal(true);
            configuration.BootstrapRecentDatabase(this);
            this.props.setPercentDownloaded(0.001);
          }}
        >
          <Text id="ToolTip.BootStrapIt" />
        </button>
        <button
          className="button"
          onClick={() => {
            this.props.CloseBootstrapModal();
            let settings = GetSettings();
            settings.bootstrap = false;
            SaveSettings(settings);
          }}
        >
          <Text id="ToolTip.SyncFromScratch" />
        </button>
      </>
    );
  }
}

const Downloading = props => (
  <>
    <h3>
      <Text id="ToolTip.RecentDatabaseDownloading" />
    </h3>
    <div className="progress-bar">
      <div className="filler" style={{ width: `${20}%` }} />
    </div>
    <h3>
      <Text id="ToolTip.PleaseWait" />
    </h3>
  </>
);

const Extracting = () => (
  <>
    <h3>
      <Text id="ToolTip.RecentDatabaseExtracting" />
    </h3>

    <h3>
      <Text id="ToolTip.PleaseWait" />
    </h3>
  </>
);

const modalContent = props => {
  // if (props.percentDownloaded === 0) {
  //   if (modalOpen(props)) {
  //     const checkDiskSpace = require('check-disk-space');
  //     let dir = process.env.APPDATA || process.env.HOME;
  //     checkDiskSpace(dir).then(diskSpace => {
  //       if (diskSpace.free <= 20000000000) {
  //         enoughSpace = false;
  //         setTimeout(() => {
  //           this.forceUpdate();
  //         }, 5000);
  //       } else {
  //         enoughSpace = true;
  //       }
  //     });
  //   }
  //   return <Prompting {...props} />;
  // }

  if (true) {
    return <Downloading {...props} />;
  }

  return <Extracting />;
};

const BootstrapModal = props => (
  <Modal
    key="bootstrap-modal"
    open={modalOpen(props)}
    onClose={() => true}
    center
    showCloseIcon={false}
    classNames={{ modal: 'modal' }}
  >
    {modalContent(props)}
  </Modal>
);

export default BootstrapModal;
