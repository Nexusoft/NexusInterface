import React from 'react';
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
import { loadNamespaces } from 'lib/user';
import { apiPost } from 'lib/tritiumApi';
import { userIdRegex } from 'consts/misc';

__ = __context('TransferNamespace');

const Namespace = styled.span(({ theme }) => ({
  color: theme.foreground,
}));

@reduxForm({
  form: 'transfer-namespace',
  destroyOnUnmount: true,
  initialValues: {
    recipient: '',
  },
  validate: ({ recipient }) => {
    const errors = {};
    if (!recipient) {
      errors.recipient = __('Destination is required');
    }
    return errors;
  },
  onSubmit: async ({ recipient }, dispatch, { namespace }) => {
    const pin = await confirmPin();

    const params = { pin, address: namespace.address };
    if (userIdRegex.test(recipient)) {
      params.destination = recipient;
    } else {
      params.username = recipient;
    }

    if (pin) {
      return await apiPost('names/transfer/namespace', params);
    }
  },
  onSubmitSuccess: async (result, dispatch, props) => {
    if (!result) return; // Submission was cancelled
    loadNamespaces();
    props.closeModal();
    openSuccessDialog({
      message: __('Namespace has been transferred'),
    });
  },
  onSubmitFail: errorHandler(__('Error transferring namespace')),
})
class TransferNamespaceForm extends React.Component {
  render() {
    const { handleSubmit, namespace, submitting } = this.props;
    return (
      <form onSubmit={handleSubmit}>
        <FormField label={__('Namespace')}>
          <Namespace>{namespace.name}</Namespace>
        </FormField>

        <FormField connectLabel label={__('Transfer to')}>
          <Field
            inputRef={this.inputRef}
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
              <Spinner className="space-right" />
              <span className="v-align">{__('Transferring namespace')}...</span>
            </span>
          ) : (
            __('Transfer namespace')
          )}
        </Button>
      </form>
    );
  }
}

const TransferNamespaceModal = ({ namespace }) => (
  <Modal maxWidth={600}>
    {closeModal => (
      <>
        <Modal.Header>{__('Transfer namespace')}</Modal.Header>
        <Modal.Body>
          <TransferNamespaceForm
            closeModal={closeModal}
            namespace={namespace}
          />
        </Modal.Body>
      </>
    )}
  </Modal>
);

export default TransferNamespaceModal;
