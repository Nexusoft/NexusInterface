import React from 'react';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import styled from '@emotion/styled';

import Modal from 'components/Modal';
import Button from 'components/Button';
import FormField from 'components/FormField';
import TextField from 'components/TextField';
import Select from 'components/Select';

__ = __context('CreateName');

const typeOptions = [
  {
    value: 'local',
    display: __('Local'),
  },
  {
    value: 'namespaced',
    display: __('Namespaced'),
  },
  {
    value: 'global',
    display: __('Global'),
  },
];

const Prefix = styled.span(({ theme }) => ({
  color: theme.mixer(0.5),
  paddingLeft: '0.8em',
  marginRight: '-0.8em',
}));

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
        <FormField connectLabel label={__('Name type')}>
          <Field name="type" component={Select.RF} options={typeOptions} />
        </FormField>

        <div className="mt2">
          <Field
            name="type"
            component={({ input }) =>
              input.value === 'namespaced' && (
                <FormField connectLabel label={__('Namespace')}>
                  <Field
                    name="namespace"
                    component={TextField.RF}
                    placeholder={__('Namespace')}
                  />
                </FormField>
              )
            }
          />
        </div>

        <div className="mt2">
          <FormField connectLabel label={__('Name')}>
            <Field
              name="name"
              component={TextField.RF}
              skin="filled-inverted"
              style={{ marginTop: '.4em' }}
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
        </div>

        <div className="mt2">
          <FormField connectLabel label={__('Register address')}>
            <Field
              name="registerAddress"
              component={TextField.RF}
              placeholder={__('Register address that this name points to')}
            />
          </FormField>
        </div>

        <Button skin="primary" wide uppercase className="mt2">
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
