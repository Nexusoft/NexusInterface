import { Component } from 'react';

import ControlledModal from 'components/ControlledModal';
import TextField from 'components/TextField';
import Button from 'components/Button';

__ = __context('Send');

export default class PasswordModal extends Component {
  state = {
    password: '',
  };

  handleChange = (evt) => {
    this.setState({ password: evt.target.value });
  };

  confirmPassword = () => {
    this.props.onSubmit(this.state.password);
    this.closeModal();
  };

  render() {
    return (
      <ControlledModal
        assignClose={(closeModal) => (this.closeModal = closeModal)}
        maxWidth={500}
      >
        <ControlledModal.Header>{__('Wallet password')}</ControlledModal.Header>
        <ControlledModal.Body>
          <TextField
            type="password"
            placeholder={__('Enter your wallet password')}
            value={this.state.password}
            onChange={this.handleChange}
            style={{ marginTop: '.5em' }}
          />
        </ControlledModal.Body>
        <ControlledModal.Footer>
          <div className="flex space-between">
            <Button onClick={this.closeModal}>{__('Cancel')}</Button>
            <Button skin="primary" onClick={this.confirmPassword}>
              {__('Confirm')}
            </Button>
          </div>
        </ControlledModal.Footer>
      </ControlledModal>
    );
  }
}
