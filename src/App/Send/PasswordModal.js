import React from 'react';

import Modal from 'components/Modal';
import TextField from 'components/TextField';
import Button from 'components/Button';

__ = __context('Send');

export default class PasswordModal extends React.Component {
  state = {
    password: '',
  };

  handleChange = evt => {
    this.setState({ password: evt.target.value });
  };

  confirmPassword = () => {
    this.props.onSubmit(this.state.password);
    this.closeModal();
  };

  render() {
    return (
      <Modal
        assignClose={closeModal => (this.closeModal = closeModal)}
        maxWidth={500}
      >
        <Modal.Header>{__('Wallet password')}</Modal.Header>
        <Modal.Body>
          <TextField
            type="password"
            placeholder={__('Enter your wallet password')}
            value={this.state.password}
            onChange={this.handleChange}
            style={{ marginTop: '.5em' }}
          />
        </Modal.Body>
        <Modal.Footer>
          <div className="flex space-between">
            <Button onClick={this.closeModal}>{__('Cancel')}</Button>
            <Button skin="primary" onClick={this.confirmPassword}>
              {__('Confirm')}
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    );
  }
}
