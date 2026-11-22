import Button from 'components/Button';
import RegistryModalHeader from '../RegistryModalHeader';
import Form from 'components/Form';
import ControlledModal from 'components/ControlledModal';
import FormField from 'components/FormField';
import Spinner from 'components/Spinner';
import { formSubmit, required, checkAll, regex } from 'lib/form';
import { confirmPin, openSuccessDialog } from 'lib/dialog';
import { refreshNamespaces } from 'lib/user';
import { callAPI } from 'lib/api';
import { createNamespaceFee } from 'lib/fees';
import UT from 'lib/usageTracking';

__ = __context('CreateNamespace');

// Namespace names can only contain lowercase letters, numbers, and periods (.)
const namespaceRegex = /^[a-z\d\.]+$/;

const initialValues = {
  namespace: '',
};

export default function CreateNamespaceModal() {
  return (
    <ControlledModal maxWidth={560}>
      {(closeModal) => (
        <>
          <RegistryModalHeader section="Namespaces">
            {__('Create a new namespace')}
          </RegistryModalHeader>
          <ControlledModal.Body>
            <Form
              name="create-namespace"
              persistState
              initialValues={initialValues}
              onSubmit={formSubmit({
                submit: async ({ namespace }) => {
                  const pin = await confirmPin();

                  if (pin) {
                    return await callAPI('names/create/namespace', {
                      pin,
                      namespace,
                    });
                  }
                },
                onSuccess: async (result, values, form) => {
                  if (!result) return; // Submission was cancelled
                  UT.CreateNewItem('namespace');
                  refreshNamespaces();
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
                  autoComplete="off"
                  spellCheck={false}
                  aria-describedby="namespace-hint"
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
              <p className="modal-hint" id="namespace-hint">{__('Namespace names can only contain lowercase letters, numbers, and periods (.)')}</p>

              <div className="modal-fee">
                <span>{__('Namespace creation fee')}</span><strong>{createNamespaceFee} NXS</strong>
              </div>

              <div className="modal-actions"><Button type="button" skin="primary" onClick={closeModal}>{__('Cancel')}</Button><Form.SubmitButton skin="filled-primary">
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
              </Form.SubmitButton></div>
            </Form>
          </ControlledModal.Body>
        </>
      )}
    </ControlledModal>
  );
}
