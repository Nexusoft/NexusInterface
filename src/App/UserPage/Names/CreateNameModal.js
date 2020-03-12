import React from 'react';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import styled from '@emotion/styled';

import Modal from 'components/Modal';
import Button from 'components/Button';
import FormField from 'components/FormField';
import TextField from 'components/TextField';
import Spinner from 'components/Spinner';
import Select from 'components/Select';
import confirmPin from 'utils/promisified/confirmPin';
import { errorHandler } from 'utils/form';
import { openSuccessDialog } from 'lib/ui';
import {
  createLocalNameFee,
  createNamespacedNameFee,
  createGlobalNameFee,
} from 'lib/fees';
import { loadNameRecords, loadNamespaces } from 'lib/user';
import { apiPost } from 'lib/tritiumApi';

__ = __context('CreateName');

const Prefix = styled.span(({ theme }) => ({
  color: theme.mixer(0.5),
  paddingLeft: '0.8em',
  marginRight: '-0.8em',
}));

const NameTypes = styled.div({
  display: 'grid',
  fontSize: '.9em',
  columnGap: '1em',
  gridTemplateColumns: '1fr 1fr 1fr',
});

const NameTypeSelect = ({ input, hasNamespaces }) => (
  <NameTypes>
    <Button
      uppercase
      skin={input.value === 'local' ? 'filled-primary' : 'default'}
      onClick={() => {
        input.onChange('local');
      }}
    >
      {__('Local')}
    </Button>
    <Button
      uppercase
      skin={input.value === 'namespaced' ? 'filled-primary' : 'default'}
      disabled={!hasNamespaces}
      onClick={() => {
        input.onChange('namespaced');
      }}
    >
      {__('Namespaced')}
    </Button>
    <Button
      uppercase
      skin={input.value === 'global' ? 'filled-primary' : 'default'}
      onClick={() => {
        input.onChange('global');
      }}
    >
      {__('Global')}
    </Button>
  </NameTypes>
);

@connect(state => ({
  username: state.user.status && state.user.status.username,
  namespaces: state.user.namespaces,
}))
@reduxForm({
  form: 'create-name',
  destroyOnUnmount: false,
  initialValues: {
    type: 'local',
    namespace: '',
    name: '',
    registerAddress: '',
  },
  validate: ({ name, namespace, type }) => {
    const errors = {};
    if (!name || !name.trim()) {
      errors.name = __('Name is required');
    } else if (name.startsWith(':')) {
      errors.name = __('Name cannot start with a colon character');
    }

    if (type === 'namespaced' && (!namespace || !namespace.trim())) {
      errors.namespace = __('Namespace is required');
    }

    return errors;
  },
  onSubmit: async ({ type, name, namespace, registerAddress }) => {
    const pin = await confirmPin();

    if (pin) {
      return await apiPost('names/create/name', {
        pin,
        name,
        global: type === 'global',
        namespace: type === 'namespaced' ? namespace : undefined,
        register_address: registerAddress,
      });
    }
  },
  onSubmitSuccess: async (result, dispatch, props) => {
    if (!result) return; // Submission was cancelled
    loadNameRecords();
    props.reset();
    props.closeModal();
    openSuccessDialog({
      message: __('New name has been created'),
    });
  },
  onSubmitFail: errorHandler(__('Error creating name')),
})
class CreateNameForm extends React.Component {
  constructor(props) {
    super(props);
    loadNamespaces();
  }

  render() {
    const { handleSubmit, username, namespaces, submitting } = this.props;
    return (
      <form onSubmit={handleSubmit}>
        <Field
          name="type"
          component={NameTypeSelect}
          hasNamespaces={!!namespaces && namespaces.length > 0}
        />

        <div className="mt2">
          <Field
            name="type"
            component={({ input }) =>
              input.value === 'namespaced' && (
                <FormField connectLabel label={__('Namespace')}>
                  <Field
                    name="namespace"
                    component={Select.RF}
                    options={(namespaces || []).map(n => ({
                      value: n.name,
                      display: n.name,
                    }))}
                    placeholder={__('A namespace you own')}
                  />
                </FormField>
              )
            }
          />

          <FormField connectLabel label={__('Name')}>
            <Field
              name="name"
              component={TextField.RF}
              skin="filled-inverted"
              className="mt0_4"
              placeholder={__('name')}
              left={
                <Field
                  name="type"
                  component={({ input }) => {
                    switch (input.value) {
                      case 'local':
                        return <Prefix>{username + ':'}</Prefix>;
                      case 'namespaced':
                        return (
                          <Field
                            name="namespace"
                            component={({ input }) => (
                              <Prefix>
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
            <Field
              name="registerAddress"
              component={TextField.RF}
              skin="filled-inverted"
              className="mt0_4"
              placeholder={__('Register address that this name points to')}
            />
          </FormField>

          <Field
            name="type"
            component={({ input }) => (
              <div className="mt2" style={{ textAlign: 'left' }}>
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
              <span className="v-align">{__('Creating name')}...</span>
            </span>
          ) : (
            __('Create name')
          )}
        </Button>
      </form>
    );
  }
}

const CreateNameModal = () => (
  <Modal style={{ maxWidth: 500 }}>
    {closeModal => (
      <>
        <Modal.Header>{__('Create a new name')}</Modal.Header>
        <Modal.Body>
          <CreateNameForm closeModal={closeModal} />
        </Modal.Body>
      </>
    )}
  </Modal>
);

export default CreateNameModal;
