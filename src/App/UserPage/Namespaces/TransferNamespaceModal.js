import { Component } from 'react';
import { reduxForm, Field } from 'redux-form';
import styled from '@emotion/styled';

import ControlledModal from 'components/ControlledModal';
import Button from 'components/Button';
import FormField from 'components/FormField';
import TextField from 'components/TextField';
import Spinner from 'components/Spinner';
import { confirmPin } from 'lib/ui';
import { errorHandler } from 'utils/form';
import { openSuccessDialog } from 'lib/ui';
import { loadNamespaces } from 'lib/user';
import { callApi } from 'lib/tritiumApi';
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
      return await callApi('names/transfer/namespace', params);
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
class TransferNamespaceForm extends Component {
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
              <Spinner className="mr0_4" />
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
  <ControlledModal maxWidth={600}>
    {(closeModal) => (
      <>
        <ControlledModal.Header>
          {__('Transfer namespace')}
        </ControlledModal.Header>
        <ControlledModal.Body>
          <TransferNamespaceForm
            closeModal={closeModal}
            namespace={namespace}
          />
        </ControlledModal.Body>
      </>
    )}
  </ControlledModal>
);

export default TransferNamespaceModal;
