// External
import React from 'react';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import styled from '@emotion/styled';

// Internal
import Modal from 'components/Modal';
import Button from 'components/Button';
import Panel from 'components/Panel';
import FormField from 'components/FormField';
import TextField from 'components/TextField';
import FieldSet from 'components/FieldSet';
import { updateSettings } from 'actions/settings';
import * as Tritium from 'lib/tritium-api';
import {
  openConfirmDialog,
  openModal,
  showNotification,
  openErrorDialog,
} from 'actions/overlays';

const CreateModalComponent = styled(Modal)({
  padding: '1px',
});

const LoginFieldSet = styled(FieldSet)({
  margin: '0 auto',
});

@connect(
  null,
  dispatch => ({
    turnOnTritium: () => dispatch(updateSettings({ tritium: true })),
  })
)
class CreateUserComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      submitting: false,
    };
  }

  close = () => {
    this.closeModal();
  };

  legacyClose = () => {
    this.props.onCloseLegacy();
    this.closeModal();
  };

  goBackToLogin = () => {
    this.props.onCloseBack();
    this.closeModal();
  };

  goToRecovery = () => {
    this.props.onFinishCreate();
    this.closeModal();
  };

  changeUsername = e => {
    this.setState({});
  };

  render() {
    const { handleSubmit, submitting } = this.props;
    //const { submitting } = this.state;
    console.log(this);
    return (
      <CreateModalComponent
        fullScreen
        assignClose={close => {
          this.closeModal = close;
        }}
        {...this.props}
      >
        <Modal.Header>Tritium Login</Modal.Header>
        <Modal.Body>
          <Panel title={'Create Account'}>
            <CreateUserForm closeModal={this.goToRecovery} {...this.props} />
          </Panel>
        </Modal.Body>
      </CreateModalComponent>
    );
  }
}

export default CreateUserComponent;

@reduxForm({
  form: 'createAccount',
  destroyOnUnmount: true,
  initialValues: {
    username: '',
    password: '',
    pin: '',
  },
  validate: ({ username, password, pin }, props) => {
    const errors = {};
    console.log(`${username} , ${password} , ${pin}`);

    if (!username) {
      errors.username = 'Username';
    }
    if (!password) {
      errors.password = 'Password';
    }
    if (!pin) {
      errors.pin = 'Pin';
    }
    return errors;
  },
  onSubmit: ({ username, password, pin }, props) => {
    console.log('ONSUBMIT');
    console.log(`${username} , ${password} , ${pin}`);
    console.log(props);
    return Tritium.PROMISE(
      'API',
      { api: 'users', verb: 'create', noun: 'user' },
      [{ username: username, password: password, pin: pin }]
    );
  },
  onSubmitSuccess: async (result, dispatch, props) => {
     showNotification('Logged IN', 'success');
    console.log(result);
    console.log('PASS');
    props.turnOnTritium();
    props.closeModal();
  },
  onSubmitFail: (errors, dispatch, submitError) => {
    console.log('FAIL');

    if (!errors || !Object.keys(errors).length) {
      let note = submitError || 'Error';
      if (
        submitError === 'Error: The wallet passphrase entered was incorrect.'
      ) {
        note = 'Bad Password';
      } else if (submitError === 'value is type null, expected int') {
        note = 'Futur date';
      }
       openErrorDialog({
        message: 'Error Logging IN',
        note: note,
      });
    }
  },
})
class CreateUserForm extends React.Component {
  render() {
    const { handleSubmit, submitting } = this.props;
    return (
      <form onSubmit={handleSubmit}>
        <LoginFieldSet legend="Create Account">
          <FormField connectLabel label={'UserName'}>
            <Field
              component={TextField.RF}
              name="username"
              type="text"
              placeholder={'Username'}
              required
            />
          </FormField>
          <FormField connectLabel label={'Password'}>
            <Field
              component={TextField.RF}
              name="password"
              type="text"
              placeholder={'Password'}
            />
          </FormField>
          <FormField
            connectLabel
            label={'Pin'}
            subLable={'ASdasaddsa'}
          >
            <Field
              component={TextField.RF}
              name="pin"
              type="text"
              placeholder={'Pin'}
            />
          </FormField>
          <div style={{ padding: '5px', paddingTop: '10px' }}>
            <Button
              skin="primary"
              onClick={handleSubmit}
              wide
              disabled={submitting}
              style={{ fontSize: 17, marginTop: '5px' }}
            >
              Create Account
            </Button>
          </div>
          <div
            style={{
              marginLeft: 'auto',
              marginRight: 'auto',
              display: 'grid',
              alignItems: 'center',
              gridTemplateColumns: 'auto auto',
              gridTemplateRows: 'auto',
              gridGap: '1em .5em',
            }}
          >
            <Button
              skin="primary"
              onClick={this.goBackToLogin}
              style={{ fontSize: 17, padding: '5px' }}
            >
              Login
            </Button>
            <Button
              skin="primary"
              onClick={this.legacyClose}
              style={{ fontSize: 17, padding: '5px' }}
            >
              Legacy Mode
            </Button>
          </div>
        </LoginFieldSet>
      </form>
    );
  }
}
