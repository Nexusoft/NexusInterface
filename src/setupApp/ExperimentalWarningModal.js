// External
import React from 'react';
import { connect } from 'react-redux';

// Internal
import Modal from 'components/Modal';
import Button from 'components/Button';
import { updateSettings } from 'actions/settings';

/**
 * Shows a Warning about safety
 *
 * @class ExperimentalWarningModal
 * @extends {React.Component}
 */
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

  /**
   * Component's Renderable JSX
   *
   * @returns {JSX} JSX
   * @memberof ExperimentalWarningModal
   */
  render() {
    return (
      <Modal
        assignClose={close => {
          this.closeModal = close;
        }}
        style={{ maxWidth: 600 }}
        {...this.props}
      >
        <Modal.Body style={{ fontSize: 18 }}>
          <p>
            {__(
              'IMPROPER USE OF THIS SOFTWARE COULD LEAD TO PERMANENT LOSS OF COIN.'
            )}
          </p>
          <p>{__('BACKUP OFTEN AND KEEP ENCRYPTION KEY SAFE.')}</p>
          <p className="flex space-between" style={{ marginTop: '2em' }}>
            <Button onClick={this.dontShowAgain}>
              {__("Don't show this again")}
            </Button>
            <Button skin="primary" onClick={() => this.closeModal()}>
              {__('OK')}
            </Button>
          </p>
        </Modal.Body>
      </Modal>
    );
  }
}

export default ExperimentalWarningModal;
