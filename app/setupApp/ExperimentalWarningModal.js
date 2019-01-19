// External
import React from 'react';
import { connect } from 'react-redux';

// Internal
import Modal from 'components/Modal';
import Button from 'components/Button';
import { updateSettings } from 'actions/settingsActionCreators';

@connect(
  null,
  dispatch => ({
    disableExperimentalWarning: () =>
      dispatch(updateSettings({ experimentalWarningDisabled: true })),
  })
)
class ExperimentalWarningModal extends React.Component {
  dontShowAgain = () => {
    this.props.disableExperimentalWarning();
    this.closeModal();
  };

  render() {
    return (
      <Modal
        assignClose={close => {
          this.closeModal = close;
          console.log(close);
        }}
        style={{ maxWidth: 600 }}
        {...this.props}
      >
        <Modal.Body style={{ fontSize: 18 }}>
          <p>
            THIS SOFTWARE IS EXPERIMENTAL AND IN BETA TESTING. BY DEFAULT IT
            WILL NOT USE ANY EXISTING NEXUS WALLET NOR ADDRESSES THAT YOU MAY
            ALREADY HAVE.
          </p>
          <p>
            AS SUCH, THIS WALLET SHOULD{' '}
            <strong>
              <u>NOT</u>
            </strong>{' '}
            BE USED AS YOUR PRIMARY WALLET AND DOING SO MAY AFFECT YOUR ABILITY
            TO ACCESS YOUR COINS UP TO AND INCLUDING LOSING THEM PERMANENTLY.
          </p>
          <p>USE THIS SOFTWARE AT YOUR OWN RISK.</p>
          <p className="flex space-between" style={{ marginTop: '2em' }}>
            <Button onClick={this.dontShowAgain}>Don't show this again</Button>
            <Button skin="primary" onClick={() => this.closeModal()}>
              OK
            </Button>
          </p>
        </Modal.Body>
      </Modal>
    );
  }
}

export default ExperimentalWarningModal;
