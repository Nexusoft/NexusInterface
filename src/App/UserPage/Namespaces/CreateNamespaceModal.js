import React from 'react';
import { reduxForm, Field } from 'redux-form';

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

__ = __context('CreateNamespace');

// Namespace names can only contain lowercase letters, numbers, and periods (.)
const namespaceRegex = /^[a-z\d\.]+$/;

@reduxForm({
  form: 'create-namespace',
  destroyOnUnmount: false,
  initialValues: {
    name: '',
  },
  validate: ({ name }) => {
    const errors = {};
    if (!name || !name.trim()) {
      errors.name = __('Name is required');
    } else if (!namespaceRegex.test(name)) {
      errors.name = __(
        'Namespace names can only contain lowercase letters, numbers, and periods (.)'
      );
    }

    return errors;
  },
  onSubmit: async ({ type, name, namespace, registerAddress }) => {
    const pin = await confirmPin();

    if (pin) {
      return await apiPost('names/create/namespace', {
        pin,
        name,
      });
    }
  },
  onSubmitSuccess: async (result, dispatch, props) => {
    if (!result) return; // Submission was cancelled
    loadNamespaces();
    props.reset();
    props.closeModal();
    openSuccessDialog({
      message: __('New namespace has been created'),
    });
  },
  onSubmitFail: errorHandler(__('Error creating namespace')),
})
class CreateNamespaceForm extends React.Component {
  render() {
    const { handleSubmit, submitting } = this.props;
    return (
      <form onSubmit={handleSubmit}>
        <FormField connectLabel label={__('Name')}>
          <Field
            name="name"
            component={TextField.RF}
            skin="filled-inverted"
            className="mt0_4"
            placeholder={__('Namespace name')}
          />
        </FormField>

        <div className="mt2" style={{ textAlign: 'left' }}>
          {__('Namespace creation fee')}: 1000 NXS
        </div>

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
              <span className="v-align">{__('Creating namespace')}...</span>
            </span>
          ) : (
            __('Create namespace')
          )}
        </Button>
      </form>
    );
  }
}

const CreateNamespaceModal = () => (
  <Modal style={{ maxWidth: 450 }}>
    {closeModal => (
      <>
        <Modal.Header>{__('Create a new namespace')}</Modal.Header>
        <Modal.Body>
          <CreateNamespaceForm closeModal={closeModal} />
        </Modal.Body>
      </>
    )}
  </Modal>
);

export default CreateNamespaceModal;
