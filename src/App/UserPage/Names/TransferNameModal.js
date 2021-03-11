import { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import styled from '@emotion/styled';

import Modal from 'components/Modal';
import Button from 'components/Button';
import FormField from 'components/FormField';
import TextField from 'components/TextField';
import Spinner from 'components/Spinner';
import { confirmPin } from 'lib/ui';
import { errorHandler } from 'utils/form';
import { openSuccessDialog } from 'lib/ui';
import { loadNameRecords, selectUsername } from 'lib/user';
import { callApi } from 'lib/tritiumApi';
import { userIdRegex } from 'consts/misc';

__ = __context('TransferName');

const Prefix = styled.span(({ theme }) => ({
  color: theme.mixer(0.5),
}));

const Name = styled.span(({ theme }) => ({
  color: theme.foreground,
}));

@connect((state) => ({
  username: selectUsername(state),
}))
@reduxForm({
  form: 'transfer-name',
  destroyOnUnmount: true,
  initialValues: {
    recipient: '',
  },
  validate: ({ recipient }) => {
    const errors = {};
    if (!recipient) {
      errors.recipient = __('Recipient is required');
    }
    return errors;
  },
  onSubmit: async ({ recipient }, dispatch, { nameRecord }) => {
    const pin = await confirmPin();

    const params = { pin, address: nameRecord.address };
    if (userIdRegex.test(recipient)) {
      params.destination = recipient;
    } else {
      params.username = recipient;
    }

    if (pin) {
      return await callApi('names/transfer/name', params);
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
class TransferNameForm extends Component {
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
            name="recipient"
            autoFocus
            component={TextField.RF}
            placeholder={__('Recipient username or user ID')}
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
              <Spinner className="mr0_4" />
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
  <Modal maxWidth={600}>
    {(closeModal) => (
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
