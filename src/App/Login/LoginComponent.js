// External
import React from 'react';
import { connect } from 'react-redux';
import { reduxForm, Field, InfoForm, SubmissionError } from 'redux-form';
import styled from '@emotion/styled';

// Internal
import Modal from 'components/Modal';
import Button from 'components/Button';
import Panel from 'components/Panel';
import FormField from 'components/FormField';
import TextField from 'components/TextField';
import FieldSet from 'components/FieldSet';

import CreateUserComponent from './CreateUserComponent';

import { UpdateSettings } from 'lib/settings';
import * as Tritium from 'lib/tritiumApi';
import {
  openConfirmDialog,
  openModal,
  showNotification,
  openErrorDialog,
} from 'actions/overlays';
import { logOutUser, setCurrentUserGenesis } from 'actions/user';

const LoginModalComponent = styled(Modal)({
  padding: '1px',
});

const LoginFieldSet = styled(FieldSet)({
  maxWidth: '50%',
  margin: '0 auto',
});

@connect(
  state => ({ userGenesis: state.currentUser.userGenesis }),
  {
    openModal,
    showNotification,
    openErrorDialog,
    setCurrentUserGenesis,
    logOutUser,
  }
)
class LoginComponent extends React.Component {
  close = () => {
    //this.props.goBack();
    this.closeModal();
  };

  createButton = () => {
    this.props.openModal(CreateUserComponent);
    this.closeModal();
  };

  legacyClose = () => {
    UpdateSettings({ legacyMode: true });
    location.reload();
    this.closeModal();
  };

  testTurnOnTritium = () => {
    UpdateSettings({ legacyMode: false });
    location.reload();
    this.closeModal();
  };

  render() {
    const { userGenesis } = this.props;
    console.log(this);
    return (
      <LoginModalComponent
        assignClose={close => {
          this.closeModal = close;
        }}
        {...this.props}
      >
        <Modal.Header>Tritium User</Modal.Header>
        <Modal.Body>
          <Panel title={'Login'}>
            {userGenesis ? (
              <LogoutForm closeModal={this.close} {...this.props} />
            ) : (
              <LoginForm closeModal={this.close} {...this.props} />
            )}
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
                type="submit"
                wide
                onClick={this.createButton}
                style={{ fontSize: 17, marginTop: '5px' }}
              >
                Create Account
              </Button>

              <Button
                skin="primary"
                onClick={this.legacyClose}
                style={{ fontSize: 17, padding: '5px' }}
              >
                Legacy Mode
              </Button>
              <Button
                skin="primary"
                onClick={this.testTurnOnTritium}
                style={{ fontSize: 17, padding: '5px' }}
              >
                Test Turn On Tritium
              </Button>
            </div>
          </Panel>
        </Modal.Body>
      </LoginModalComponent>
    );
  }
}

export default LoginComponent;

@reduxForm({
  form: 'login',
  destroyOnUnmount: true,
  initialValues: {
    username: '',
    password: '',
    pin: '',
    callback: () => {},
  },
  validate: ({ username, password, pin }, props) => {
    const errors = {};
    console.log(`${username} , ${password} , ${pin}`);

    if (!username) {
      errors.username = 'UserName';
    }
    if (!password) {
      errors.password = 'Password';
    }
    if (!pin) {
      errors.pin = 'Pin';
    }
    return errors;
  },
  onSubmit: async ({ username, password, pin }, dispatch, props) => {
    return await Tritium.apiPost('users/login/user', {
      username: username,
      password: password,
      pin: pin,
    });
  },
  onSubmitSuccess: async (result, dispatch, props) => {
    props.showNotification('Logged In', 'success');
    props.setCurrentUserGenesis(result.genesis);
    props.closeModal();
  },
  onSubmitFail: (errors, dispatch, submitError) => {
    console.log('FAIL');
    console.log(errors);
    if (!errors || !Object.keys(errors).length) {
      let note = submitError || 'Error';
      if (
        submitError === 'Error: The wallet passphrase entered was incorrect.'
      ) {
        note = 'Bad Passowrd';
      } else if (submitError === 'value is type null, expected int') {
        note = 'Futur Date';
      }
      props.openErrorDialog({
        message: 'Logged In Error',
        note: note,
      });
    }
  },
})
class LoginForm extends React.Component {
  render() {
    const { handleSubmit, submitting } = this.props;
    return (
      <form onSubmit={handleSubmit}>
        <LoginFieldSet legend="Login">
          <FormField connectLabel label={'Username'}>
            <Field
              component={TextField.RF}
              name="username"
              type="text"
              placeholder={'Username'}
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
          <FormField connectLabel label={'Pin'}>
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
              style={{ fontSize: 17, padding: '5px' }}
            >
              Login With Tritium
            </Button>
          </div>
        </LoginFieldSet>
      </form>
    );
  }
}

@reduxForm({
  destroyOnUnmount: true,
  form: 'logout',
  validate: (values, props) => {
    const errors = {};
    return errors;
  },
  onSubmit: async (values, dispatch, props) => {
    const result = await Tritium.apiPost('users/logout/user', null);
    if (result.success) {
      return result;
    } else {
      throw new SubmissionError('Logout failed!');
    }
  },
  onSubmitSuccess: (result, dispatch, props) => {
    props.showNotification('Logged Out', 'success');
    props.logOutUser();
    props.closeModal();
  },
  onSubmitFail: (errors, dispatch, submitError) => {
    console.log('FAIL');
    console.log(errors);
    console.log(submitError);

    if (!errors || !Object.keys(errors).length) {
      let note = submitError || errors || 'Error';
      if (
        submitError === 'Error: The wallet passphrase entered was incorrect.'
      ) {
        note = 'Bad Passowrd';
      } else if (submitError === 'value is type null, expected int') {
        note = 'Futur Date';
      }
      props.openErrorDialog({
        message: 'Logged In Error',
        note: note,
      });
    }
  },
})
class LogoutForm extends React.Component {
  render() {
    const { handleSubmit, submitting } = this.props;
    return (
      <form onSubmit={handleSubmit}>
        <LoginFieldSet legend="Logout">
          <Button
            skin="primary"
            onClick={handleSubmit}
            wide
            disabled={submitting}
            style={{ fontSize: 17, padding: '5px' }}
          >
            Logout
          </Button>
        </LoginFieldSet>
      </form>
    );
  }
}
