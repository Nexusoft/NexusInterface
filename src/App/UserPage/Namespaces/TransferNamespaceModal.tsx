import styled from '@emotion/styled';

import Form from 'components/Form';
import ControlledModal from 'components/ControlledModal';
import FormField from 'components/FormField';
import Spinner from 'components/Spinner';
import { formSubmit, required } from 'lib/form';
import { confirmPin, openSuccessDialog } from 'lib/dialog';
import { namespacesQuery } from 'lib/user';
import { callAPI, Namespace } from 'lib/api';
import { userIdRegex } from 'consts/misc';

__ = __context('TransferNamespace');

const NamespaceName = styled.span(({ theme }) => ({
  color: theme.foreground,
}));

const initialValues = {
  recipient: '',
};

export default function TransferNamespaceModal({
  namespace,
}: {
  namespace: Namespace;
}) {
  return (
    <ControlledModal maxWidth={600}>
      {(closeModal) => (
        <>
          <ControlledModal.Header>
            {__('Transfer namespace')}
          </ControlledModal.Header>
          <ControlledModal.Body>
            <Form
              name="transfer-namespace"
              initialValues={initialValues}
              onSubmit={formSubmit({
                submit: async ({ recipient }) => {
                  const pin = await confirmPin();

                  if (pin) {
                    const params: {
                      pin: string;
                      address?: string;
                      username?: string;
                      destination?: string;
                    } = { pin, address: namespace.address };
                    if (userIdRegex.test(recipient)) {
                      params.destination = recipient;
                    } else {
                      params.username = recipient;
                    }

                    return await callAPI('names/transfer/namespace', params);
                  }
                  return undefined;
                },
                onSuccess: async (result) => {
                  if (!result) return; // Submission was cancelled
                  namespacesQuery.refetch();
                  closeModal();
                  openSuccessDialog({
                    message: __('Namespace has been transferred'),
                  });
                },
                errorMessage: __('Error transferring namespace'),
              })}
            >
              <FormField label={__('Namespace')}>
                <NamespaceName>{namespace.namespace}</NamespaceName>
              </FormField>

              <FormField connectLabel label={__('Transfer to')}>
                <Form.TextField
                  name="recipient"
                  autoFocus
                  placeholder={__('Recipient username or user ID')}
                  validate={required()}
                />
              </FormField>

              <Form.SubmitButton skin="primary" wide uppercase className="mt3">
                {({ submitting }) =>
                  submitting ? (
                    <span>
                      <Spinner className="mr0_4" />
                      <span className="v-align">
                        {__('Transferring namespace')}...
                      </span>
                    </span>
                  ) : (
                    __('Transfer namespace')
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
