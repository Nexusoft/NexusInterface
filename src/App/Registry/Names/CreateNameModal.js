import RegistryModalHeader from '../RegistryModalHeader';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useField } from 'react-final-form';
import styled from '@emotion/styled';

import Form from 'components/Form';
import ControlledModal from 'components/ControlledModal';
import Button from 'components/Button';
import FormField from 'components/FormField';
import Spinner from 'components/Spinner';
import { formSubmit, required, checkAll } from 'lib/form';
import { confirmPin, openSuccessDialog } from 'lib/dialog';
import {
  createLocalNameFee,
  createNamespacedNameFee,
  createGlobalNameFee,
} from 'lib/fees';
import { refreshNameRecords, refreshNamespaces } from 'lib/user';
import { selectUsername } from 'lib/session';
import { callAPI } from 'lib/api';
import UT from 'lib/usageTracking';

__ = __context('CreateName');

const Prefix = styled.span(({ theme }) => ({
  color: theme.mixer(0.5),
  paddingLeft: theme.modern ? 0 : '0.8em',
  marginRight: theme.modern ? 0 : '-0.8em',
  flex: '0 1 auto',
  maxWidth: '50%',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}));

const NameTypes = styled.div({
  display: 'grid',
  fontSize: '.9em',
  columnGap: '1em',
  gridTemplateColumns: '1fr 1fr 1fr',
  marginBottom: '2em',
});

function NameType({ namespaces }) {
  const { input } = useField('type');
  return (
    <>
      <NameTypes>
        <Button
          uppercase
          skin={input.value === 'local' ? 'filled-primary' : 'primary'}
          onClick={() => {
            input.onChange('local');
          }}
        >
          {__('Local')}
        </Button>
        <Button
          uppercase
          skin={input.value === 'namespaced' ? 'filled-primary' : 'primary'}
          disabled={!namespaces?.length}
          onClick={() => {
            input.onChange('namespaced');
          }}
        >
          {__('Namespaced')}
        </Button>
        <Button
          uppercase
          skin={input.value === 'global' ? 'filled-primary' : 'primary'}
          onClick={() => {
            input.onChange('global');
          }}
        >
          {__('Global')}
        </Button>
      </NameTypes>

      {input.value === 'namespaced' && (
        <FormField connectLabel label={__('Namespace')}>
          <Form.Select
            name="namespace"
            options={(namespaces || []).map((n) => ({
              value: n.namespace,
              display: n.namespace,
            }))}
            placeholder={__('A namespace you own')}
            validate={required()}
          />
        </FormField>
      )}
    </>
  );
}

const initialValues = {
  type: 'local',
  namespace: '',
  name: '',
  registerAddress: '',
};

const notStartWithColon = (value) =>
  value.startsWith(':')
    ? __('Name cannot start with a colon character')
    : undefined;

export default function CreateNameModal() {
  const username = useSelector(selectUsername);
  const namespaces = useSelector((state) => state.user.namespaces);
  useEffect(() => {
    refreshNamespaces();
  }, []);
  return (
    <ControlledModal maxWidth={500}>
      {(closeModal) => (
        <>
          <RegistryModalHeader section="Names">
            {__('Create a new name')}
          </RegistryModalHeader>
          <ControlledModal.Body>
            <Form
              name="create-name"
              persistState
              initialValues={initialValues}
              onSubmit={formSubmit({
                submit: async ({ type, name, namespace, registerAddress }) => {
                  const pin = await confirmPin();

                  if (pin) {
                    return await callAPI('names/create/name', {
                      pin,
                      name,
                      global: type === 'global',
                      namespace: type === 'namespaced' ? namespace : undefined,
                      register: registerAddress,
                    });
                  }
                },
                onSuccess: async (result, values, form) => {
                  if (!result) return; // Submission was cancelled
                  UT.CreateNewItem('name');
                  refreshNameRecords();
                  form.restart();
                  closeModal();
                  openSuccessDialog({
                    message: __('New name has been created'),
                  });
                },
                errorMessage: __('Error creating name'),
              })}
            >
              <NameType namespaces={namespaces} />

              <FormField connectLabel label={__('Name')}>
                <Form.TextField
                  name="name"
                  skin="filled-inverted"
                  className="mt0_4"
                  placeholder={__('name')}
                  inputStyle={{ minWidth: 0, flex: '1 1 0' }}
                  validate={checkAll(required(), notStartWithColon)}
                  left={
                    <Form.Field
                      name="type"
                      component={({ input }) => {
                        switch (input.value) {
                          case 'local':
                            return <Prefix title={username + ':'}>{username + ':'}</Prefix>;
                          case 'namespaced':
                            return (
                              <Form.Field
                                name="namespace"
                                component={({ input }) => (
                                  <Prefix title={(input.value || __('namespace')) + '::'}>
                                    {(input.value || __('namespace')) + '::'}
                                  </Prefix>
                                )}
                              />
                            );
                          default:
                            return null;
                        }
                      }}
                    />
                  }
                />
              </FormField>

              <FormField connectLabel label={__('Register address')}>
                <Form.TextField
                  name="registerAddress"
                  skin="filled-inverted"
                  className="mt0_4"
                  placeholder={__('Register address that this name points to')}
                />
              </FormField>

              <Form.Field
                name="type"
                component={({ input }) => (
                  <div className="modal-fee">
                    {__('Name creation fee')}:{' '}
                    {input.value === 'global'
                      ? createGlobalNameFee
                      : input.value === 'namespaced'
                      ? createNamespacedNameFee
                      : createLocalNameFee}{' '}
                    NXS
                  </div>
                )}
              />

              <div className="modal-actions"><Button type="button" skin="primary" onClick={closeModal}>{__('Cancel')}</Button><Form.SubmitButton skin="filled-primary">
                {({ submitting }) =>
                  submitting ? (
                    <span>
                      <Spinner className="mr0_4" />
                      <span className="v-align">{__('Creating name')}...</span>
                    </span>
                  ) : (
                    __('Create name')
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
