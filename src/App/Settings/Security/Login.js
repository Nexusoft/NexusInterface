// External Dependencies
import React, { Component } from 'react';
import { reduxForm, Field } from 'redux-form';
import styled from '@emotion/styled';
import { connect } from 'react-redux';

// Internal Dependencies
import { getInfo } from 'actions/coreActionCreators';
import * as RPC from 'lib/rpc';
import Text from 'components/Text';
import FormField from 'components/FormField';
import TextField from 'components/TextField';
import Button from 'components/Button';
import FieldSet from 'components/FieldSet';
import Switch from 'components/Switch';
import UIController from 'components/UIController';

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
 *  Login Form
 *
 * @class Login
 * @extends {Component}
 */
@connect(state => ({
  tritium:
    state.core.info.version.includes('0.3') ||
    parseFloat(state.core.info.version) >= 3,
}))
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
  validate: ({ date, time, password, setLoginTimeOut }, props) => {
    const errors = {};

    if (!props.tritium || setLoginTimeOut) {
      if (!date) {
        errors.date = <Text id="Settings.Errors.LoginDate" />;
      }
      if (!time) {
        errors.time = <Text id="Settings.Errors.LoginTime" />;
      }
      if (date && time) {
        let unlockUntil = 0;
        const now = new Date();
        let unlockDate = new Date(date);
        unlockDate = new Date(unlockDate.setMinutes(now.getTimezoneOffset()));
        unlockDate = new Date(unlockDate.setHours(time.slice(0, 2)));
        unlockDate = new Date(unlockDate.setMinutes(time.slice(3)));
        unlockUntil = Math.round((unlockDate.getTime() - now.getTime()) / 1000);

        if (unlockUntil < 3600) {
          errors.time = <Text id="Settings.Errors.LoginTimeTooClose" />;
        }
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
   * Render the date & time pickers
   *
   * @param {*} props
   * @memberof Login
   */
  renderTimeInputs = ({ input }) =>
    !this.props.tritium || input.value ? (
      <div>
        <FormField connectLabel label={<Text id="Settings.LoginDate" />}>
          <Field component={TextField.RF} name="date" type="date" />
        </FormField>
        <FormField connectLabel label={<Text id="Settings.LoginTime" />}>
          <Field component={TextField.RF} name="time" type="time" />
        </FormField>
      </div>
    ) : null;

  /**
   * Component's Renderable JSX
   *
   * @returns
   * @memberof Login
   */
  render() {
    const { handleSubmit, submitting, tritium } = this.props;

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
            {tritium && (
              <FormField inline connectLabel label={'SET TIMEOUT FOR LOGIN'}>
                <Field component={Switch.RF} name="setLoginTimeOut" />
              </FormField>
            )}
            <Field name="setLoginTimeOut" component={this.renderTimeInputs} />

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

export default Login;
