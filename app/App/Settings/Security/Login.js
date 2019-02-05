// External Dependencies
import React, { Component } from 'react';
import { reduxForm, Field, formValueSelector } from 'redux-form';
import styled from '@emotion/styled';
import { connect } from 'react-redux';

// Internal Dependencies
import getInfo from 'actions/getInfo';
import * as RPC from 'scripts/rpc';
import Text from 'components/Text';
import FormField from 'components/FormField';
import TextField from 'components/TextField';
import Button from 'components/Button';
import FieldSet from 'components/FieldSet';
import Switch from 'components/Switch';
import UIController from 'components/UIController';

let tritium = true;

const LoginFieldSet = styled(FieldSet)({
  maxWidth: 400,
  margin: '0 auto',
});

const Buttons = styled.div({
  display: 'flex',
  justifyContent: 'flex-end',
  marginTop: '1.5em',
});

/**
 * Login JSX
 *
 * @class Login
 * @extends {Component}
 */
@reduxForm({
  form: 'login',
  destroyOnUnmount: false,
  initialValues: {
    date: null,
    time: null,
    password: '',
    stakingOnly: false,
    setLoginTimeOut: false,
  },
  validate: ({ date, time, password }) => {
    const errors = {};
    if (!tritium) {
      if (!date) {
        errors.date = <Text id="Settings.Errors.LoginDate" />;
      }
      if (!time) {
        errors.time = <Text id="Settings.Errors.LoginTime" />;
      }
    }

    if (!password) {
      errors.password = <Text id="Settings.Errors.LoginPassword" />;
    }
    return errors;
  },
  onSubmit: ({ date, time, password, stakingOnly }) => {
    let unlockUntil = 0;

    if (date && time) {
      const now = new Date();
      let unlockDate = new Date(date);
      unlockDate = new Date(unlockDate.setMinutes(now.getTimezoneOffset()));
      unlockDate = new Date(unlockDate.setHours(time.slice(0, 2)));
      unlockDate = new Date(unlockDate.setMinutes(time.slice(3)));
      unlockUntil = Math.round((unlockDate.getTime() - now.getTime()) / 1000);
    }

    return RPC.PROMISE('walletpassphrase', [
      password,
      unlockUntil,
      stakingOnly,
    ]);
  },
  onSubmitSuccess: async (result, dispatch, props) => {
    props.reset();
    UIController.showNotification(<Text id="Settings.LoggedIn" />, 'success');
    dispatch(getInfo());
  },
  onSubmitFail: (errors, dispatch, submitError) => {
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
class Login extends Component {
  /**
   * Get min date to lock
   *
   * @returns
   * @memberof Login
   */
  getMinDate() {
    const today = new Date();
    let month = today.getMonth() + 1;
    if (month < 10) {
      month = '0' + month;
    }
    return `${today.getFullYear()}-${month}-${today.getDate()}`;
  }

  /**
   * React Render
   *
   * @returns
   * @memberof Login
   */
  render() {
    const { handleSubmit, submitting } = this.props;

    return (
      <div>
        <form onSubmit={handleSubmit}>
          <LoginFieldSet legend="Login">
            <Text id="Settings.PasswordPlaceholder">
              {text => (
                <FormField connectLabel label={<Text id="Settings.Password" />}>
                  <Field
                    component={TextField.RF}
                    name="password"
                    type="password"
                    placeholder={text}
                  />
                </FormField>
              )}
            </Text>
            <FormField
              inline
              connectLabel
              label={<Text id="Settings.StakingOnly" />}
            >
              <Field component={Switch.RF} name="stakingOnly" />
            </FormField>
            {this.props.tritium && (
              <FormField inline connectLabel label={'SET TIMEOUT FOR LOGIN'}>
                <Field component={Switch.RF} name="setLoginTimeOut" />
              </FormField>
            )}
            {this.props.showTimeInputs && (
              <div>
                <FormField
                  connectLabel
                  label={<Text id="Settings.LoginDate" />}
                >
                  <Field
                    component={TextField.RF}
                    name="date"
                    type="date"
                    min={this.getMinDate()}
                  />
                </FormField>
                <FormField
                  connectLabel
                  label={<Text id="Settings.LoginTime" />}
                >
                  <Field component={TextField.RF} name="time" type="time" />
                </FormField>
              </div>
            )}

            <Buttons>
              <Button type="submit" skin="primary" disabled={submitting}>
                Log in
              </Button>
            </Buttons>
          </LoginFieldSet>
        </form>
      </div>
    );
  }
}

const selector = formValueSelector('login');
Login = connect(state => {
  let showTimeInputs = selector(state, 'setLoginTimeOut');

  if (!state.overview.version.includes('0.3')) {
    showTimeInputs = true;
    tritium = false;
  }
  return {
    showTimeInputs,
    tritium,
  };
})(Login);

export default Login;
