import Form from 'components/Form';
import ControlledModal from 'components/ControlledModal';
import FormField from 'components/FormField';
import Spinner from 'components/Spinner';
import { formSubmit, required, checkAll, regex } from 'lib/form';
import { confirmPin, openSuccessDialog } from 'lib/dialog';
import { loadNamespaces } from 'lib/user';
import { callApi } from 'lib/api';
import { createNamespaceFee } from 'lib/fees';

__ = __context('CreateNamespace');

// Namespace names can only contain lowercase letters, numbers, and periods (.)
const namespaceRegex = /^[a-z\d\.]+$/;

const initialValues = {
  namespace: '',
};

export default function CreateNamespaceModal() {
  return (
    <ControlledModal maxWidth={450}>
      {(closeModal) => (
        <>
          <ControlledModal.Header>
            {__('Create a new namespace')}
          </ControlledModal.Header>
          <ControlledModal.Body>
            <Form
              name="create-namespace"
              persistState
              initialValues={initialValues}
              onSubmit={formSubmit({
                submit: async ({ namespace }) => {
                  const pin = await confirmPin();

                  if (pin) {
                    return await callApi('names/create/namespace', {
                      pin,
                      namespace,
                    });
                  }
                },
                onSuccess: async (result, values, form) => {
                  if (!result) return; // Submission was cancelled
                  loadNamespaces();
                  form.restart();
                  closeModal();
                  openSuccessDialog({
                    message: __('New namespace has been created'),
                  });
                },
                errorMessage: __('Error creating namespace'),
              })}
            >
              <FormField connectLabel label={__('Name')}>
                <Form.TextField
                  name="namespace"
                  skin="filled-inverted"
                  className="mt0_4"
                  placeholder={__('Namespace name')}
                  validate={checkAll(
                    required(),
                    regex(
                      namespaceRegex,
                      __(
                        'Namespace names can only contain lowercase letters, numbers, and periods (.)'
                      )
                    )
                  )}
                />
              </FormField>

              <div className="mt2" style={{ textAlign: 'left' }}>
                {__('Namespace creation fee')}: {createNamespaceFee} NXS
              </div>

              <Form.SubmitButton skin="primary" wide uppercase className="mt3">
                {({ submitting }) =>
                  submitting ? (
                    <span>
                      <Spinner className="mr0_4" />
                      <span className="v-align">
                        {__('Creating namespace')}...
                      </span>
                    </span>
                  ) : (
                    __('Create namespace')
                  )
                }
              </Form.SubmitButton>
            </Form>
          </ControlledModal.Body>
        </>
      )}
    </ControlledModal>
  );
}
