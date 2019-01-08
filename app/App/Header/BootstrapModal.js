// External Dependencies
import React, { Component } from 'react';
import Text from 'components/Text';
import Modal from 'react-responsive-modal';

// Internal Global Dependencies
import { GetSettings, SaveSettings } from 'api/settings';
import configuration from 'api/configuration';

var enoughSpace = true;
var downloadSpeedDatapoints = [];
var downloadSpeedAverage;
var downloadTotalSize = 0;
var downloadSpeedInterval;

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

let timesld = 0;

const downloadSpeedFunction = function(incomingProps)
  {
    console.log(incomingProps);
    let datapoint = incomingProps.percentDownloaded;
    const lastDataPoint = downloadSpeedDatapoints[downloadSpeedDatapoints.length - 1] || 0;
    console.log(datapoint);
    datapoint = datapoint - timesld;
    timesld = incomingProps.percentDownloaded;
    datapoint = Math.abs(datapoint);
    datapoint = Number.parseFloat(datapoint.toPrecision(4));
     downloadSpeedDatapoints.push(datapoint);
      let sum = 0;
      for (let index = 0; index < downloadSpeedDatapoints.length; index++) {
        const element = downloadSpeedDatapoints[index];
        sum += element;
      }
      console.log(sum);
      downloadSpeedAverage  = sum / downloadSpeedDatapoints.length;
      console.log(downloadSpeedAverage);
      downloadSpeedAverage = (downloadSpeedAverage/100) * downloadTotalSize;
      console.log(incomingProps.percentDownloaded);
      let kdkdkkdk = downloadSpeedAverage/3;
      console.log(kdkdkkdk);
      kdkdkkdk = (downloadTotalSize * ((100 - incomingProps.percentDownloaded) / 100)) / kdkdkkdk ;
      downloadSpeedAverage = (downloadSpeedAverage/1000).toFixed(2) + "kb Finished in:" + kdkdkkdk.toFixed(4) + " Seconds";
      console.log(downloadSpeedDatapoints);
      console.log(datapoint);
      console.log(lastDataPoint);
      console.log(downloadTotalSize);
      console.log((downloadSpeedAverage/100) * downloadTotalSize);
  }

class Prompting extends Component {

  componentDidMount()
  {
    this.getDatabaseSize();
  }

  getDatabaseSize = async function(self) {
    downloadTotalSize = await configuration.GetBootstrapSize();
    
  }

  componentWillUnmount()
  {
    downloadSpeedInterval = null;
  }

  

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
    <h2>
      <Text id="ToolTip.DatabaseDownloadSpead" />
      {
        downloadSpeedAverage
      }
    </h2>
    <div className="progress-bar">
      <div
        className="filler"
        style={{ width: `${props.percentDownloaded}%` }}
      />
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
  if (props.percentDownloaded === 0) {
    if (modalOpen(props)) {
      const checkDiskSpace = require('check-disk-space');
      let dir = process.env.APPDATA || process.env.HOME;
      checkDiskSpace(dir).then(diskSpace => {
        if (diskSpace.free <= 20000000000) {
          enoughSpace = false;
          setTimeout(() => {
            this.forceUpdate();
          }, 5000);
        } else {
          enoughSpace = true;
        }
      });
    }
    return <Prompting {...props} />;
  }

  if (props.percentDownloaded < 100) {
    
    console.log("before");
    downloadSpeedFunction(props);
    console.log("after");
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
    focusTrapped={true}
    showCloseIcon={false}
    classNames={{ modal: 'modal' }}
  >
    {modalContent(props)}
  </Modal>
);

export default BootstrapModal;
