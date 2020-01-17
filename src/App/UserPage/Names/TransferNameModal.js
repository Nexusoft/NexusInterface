import React from 'react';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import styled from '@emotion/styled';

import Modal from 'components/Modal';
import Button from 'components/Button';
import FormField from 'components/FormField';
import TextField from 'components/TextField';
import Spinner from 'components/Spinner';
import confirmPin from 'utils/promisified/confirmPin';
import { errorHandler } from 'utils/form';
import { openSuccessDialog } from 'lib/ui';
import { loadNameRecords } from 'lib/user';
import { apiPost } from 'lib/tritiumApi';

__ = __context('TransferName');

const Prefix = styled.span(({ theme }) => ({
  color: theme.mixer(0.5),
}));

const Name = styled.span(({ theme }) => ({
  color: theme.foreground,
}));

@connect(state => ({
  username: state.core.userStatus && state.core.userStatus.username,
}))
@reduxForm({
  form: 'transfer-name',
  destroyOnUnmount: true,
  initialValues: {
    destination: '',
  },
  validate: ({ destination }) => {
    const errors = {};
    if (!destination) {
      errors.destination = __('Destination is required');
    }
    return errors;
  },
  onSubmit: async ({ destination }, dispatch, { nameRecord }) => {
    const pin = await confirmPin();

    const params = { pin, address: nameRecord.address };
    const validation = await apiPost('system/validate/address', {
      address: destination,
    });
    if (validation.is_valid) {
      params.destination = destination;
    } else {
      params.username = destination;
    }

    if (pin) {
      return await apiPost('names/transfer/name', params);
    }
  },
  onSubmitSuccess: async (result, dispatch, props) => {
    if (!result) return; // Submission was cancelled
    loadNameRecords();
    props.closeModal();
    openSuccessDialog({
      message: __('Name has been transferred'),
    });
  },
  onSubmitFail: errorHandler(__('Error transferring name')),
})
class TransferNameForm extends React.Component {
  render() {
    const { handleSubmit, username, nameRecord, submitting } = this.props;
    return (
      <form onSubmit={handleSubmit}>
        <FormField label={__('Name')}>
          {nameRecord.global ? null : nameRecord.namespace ? (
            <Prefix>{nameRecord.namespace + '::'}</Prefix>
          ) : (
            <Prefix>{username + ':'}</Prefix>
          )}
          <Name>{nameRecord.name}</Name>
        </FormField>

        <FormField connectLabel label={__('Transfer to')}>
          <Field
            inputRef={this.inputRef}
            name="destination"
            autoFocus
            component={TextField.RF}
            placeholder={__('Destination name or address')}
          />
        </FormField>

        <Button
          skin="primary"
          wide
          uppercase
          className="mt3"
          type="submit"
          disabled={submitting}
        >
          {submitting ? (
            <span>
              <Spinner className="space-right" />
              <span className="v-align">{__('Transferring name')}...</span>
            </span>
          ) : (
            __('Transfer name')
          )}
        </Button>
      </form>
    );
  }
}

const TransferNameModal = ({ nameRecord }) => (
  <Modal style={{ maxWidth: 600 }}>
    {closeModal => (
      <>
        <Modal.Header>{__('Transfer name')}</Modal.Header>
        <Modal.Body>
          <TransferNameForm closeModal={closeModal} nameRecord={nameRecord} />
        </Modal.Body>
      </>
    )}
  </Modal>
);

export default TransferNameModal;
