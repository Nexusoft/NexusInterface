// External Dependencies
import React, { Component } from 'react';
import { reduxForm, Field } from 'redux-form';
import styled from '@emotion/styled';
import { connect } from 'react-redux';

// Internal Dependencies
import { getInfo } from 'actions/core';
import rpc from 'lib/rpc';
import FormField from 'components/FormField';
import TextField from 'components/TextField';
import Button from 'components/Button';
import FieldSet from 'components/FieldSet';
import Switch from 'components/Switch';
import { showNotification, openErrorDialog } from 'actions/overlays';

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
@connect(
  state => ({
    tritium:
      state.core.info.version.includes('0.3') ||
      parseFloat(state.core.info.version) >= 3,
  }),
  { showNotification, openErrorDialog }
)
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
        errors.date = __('Date is required');
      }
      if (!time) {
        errors.time = __('Time is required');
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
          errors.time = __('Time must be at least one hour in the future');
        }
      }
    }

    if (!password) {
      errors.password = __('Password is required');
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

    return rpc('walletpassphrase', [password, unlockUntil, stakingOnly]);
  },
  onSubmitSuccess: async (result, dispatch, props) => {
    props.reset();
    props.showNotification(__('Logged in successfully'), 'success');
    dispatch(getInfo());
  },
  onSubmitFail: (errors, dispatch, submitError, props) => {
    if (!errors || !Object.keys(errors).length) {
      let note = submitError || __('An unknown error occurred');
      if (
        submitError === 'Error: The wallet passphrase entered was incorrect.'
      ) {
        note = __('Incorrect password');
      } else if (submitError === 'value is type null, expected int') {
        note = __(
          'Unlock until date/time must be at least an hour in the future'
        );
      }
      props.openErrorDialog({
        message: __('Error logging in'),
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
        <FormField connectLabel label={__('Login until date')}>
          <Field
            component={TextField.RF}
            name="date"
            type="date"
            min={new Date().toISOString().slice(0, 10)}
          />
        </FormField>
        <FormField connectLabel label={__('Login until time')}>
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
            <FormField connectLabel label={__('Password')}>
              <Field
                component={TextField.RF}
                name="password"
                type="password"
                placeholder={__('Your wallet password')}
              />
            </FormField>
            <FormField
              inline
              connectLabel
              label={__('Login for staking & mining only')}
            >
              <Field component={Switch.RF} name="stakingOnly" />
            </FormField>
            {tritium && (
              <FormField
                inline
                connectLabel
                label={__('SET TIMEOUT FOR LOGIN')}
              >
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
