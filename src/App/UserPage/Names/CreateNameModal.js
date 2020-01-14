import React from 'react';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import styled from '@emotion/styled';

import Modal from 'components/Modal';
import Button from 'components/Button';
import FormField from 'components/FormField';
import TextField from 'components/TextField';

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

const NameTypeSelect = ({ input }) => (
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
  username: state.core.userStatus && state.core.userStatus.username,
}))
@reduxForm({
  form: 'create-name',
  initialValues: {
    type: 'local',
    namespace: '',
    name: '',
    registerAddress: '',
  },
  validate: ({ name, registerAddress }) => {
    const errors = {};
    if (!name || !name.trim()) {
      errors.name = __('Name is required');
    } else if (name.startsWith(':')) {
      errors.name = __('Name cannot start with a colon character');
    }

    if (!registerAddress) {
      errors.registerAddress = __('Register address is required');
    }

    return errors;
  },
})
class CreateNameForm extends React.Component {
  render() {
    const { handleSubmit, username } = this.props;
    return (
      <form onSubmit={handleSubmit}>
        <Field name="type" component={NameTypeSelect} />

        <div className="mt2">
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

          <Field
            name="type"
            component={({ input }) =>
              input.value === 'namespaced' && (
                <FormField connectLabel label={__('Namespace')}>
                  <Field
                    name="namespace"
                    component={TextField.RF}
                    skin="filled-inverted"
                    className="mt0_4"
                    placeholder={__('Namespace')}
                  />
                </FormField>
              )
            }
          />

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
                {__('Name creation fee')}: {input.value === 'global' ? 2000 : 1}{' '}
                NXS
              </div>
            )}
          />
        </div>

        <Button skin="primary" wide uppercase className="mt3">
          {__('Create name')}
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
