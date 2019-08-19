// External
import React from 'react';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import styled from '@emotion/styled';

// Internal
import Modal from 'components/Modal';
import Button from 'components/Button';
import Panel from 'components/Panel';
import Text from 'components/Text';
import FormField from 'components/FormField';
import TextField from 'components/TextField';
import FieldSet from 'components/FieldSet';
import { updateSettings } from 'actions/settingsActionCreators';
import * as Backend from 'scripts/backend-com';
import UIController from 'components/UIController';

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
      errors.username = <Text id="Settings.Errors.LoginUsername" />;
    }
    if (!password) {
      errors.password = <Text id="Settings.Errors.LoginPassword" />;
    }
    if (!pin) {
      errors.pin = <Text id="Settings.Errors.LoginPin" />;
    }
    return errors;
  },
  onSubmit: ({ username, password, pin }, props) => {
    console.log('ONSUBMIT');
    console.log(`${username} , ${password} , ${pin}`);
    console.log(props);
    return Backend.RunCommand(
      'API',
      { api: 'users', verb: 'create', noun: 'user' },
      [{ username: username, password: password, pin: pin }]
    );
  },
  onSubmitSuccess: async (result, dispatch, props) => {
    UIController.showNotification(<Text id="Settings.LoggedIn" />, 'success');
    console.log(result);
    console.log('PASS');
    props.turnOnTritium();
    props.closeModal();
  },
  onSubmitFail: (errors, dispatch, submitError) => {
    console.log('FAIL');

    if (!errors || !Object.keys(errors).length) {
      let note = submitError || <Text id="Common.UnknownError" />;
      if (
        submitError === 'Error: The wallet passphrase entered was incorrect.'
      ) {
        note = <Text id="Alert.IncorrectPasssword" />;
      } else if (submitError === 'value is type null, expected int') {
        note = <Text id="Alert.FutureDate" />;
      }
      UIController.openErrorDialog({
        message: <Text id="Settings.Errors.LoggingIn" />,
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
          <FormField connectLabel label={<Text id="Settings.Username" />}>
            <Field
              component={TextField.RF}
              name="username"
              type="text"
              placeholder={'Username'}
              required
            />
          </FormField>
          <FormField connectLabel label={<Text id="Settings.Password" />}>
            <Field
              component={TextField.RF}
              name="password"
              type="text"
              placeholder={'Password'}
            />
          </FormField>
          <FormField
            connectLabel
            label={<Text id="Settings.Pin" />}
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
