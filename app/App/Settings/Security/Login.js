// External Dependencies
import React, { Component } from 'react';
import { reduxForm, Field } from 'redux-form';
import styled from '@emotion/styled';

// Internal Dependencies
import getInfo from 'actions/getInfo';
import * as RPC from 'scripts/rpc';
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

@reduxForm({
  form: 'login',
  initialValues: {
    date: null,
    time: null,
    password: '',
    stakingOnly: false,
  },
  validate: ({ date, time, password }) => {
    const errors = {};
    if (!date) {
      errors.date = 'Date is required';
    }
    if (!time) {
      errors.time = 'Time is required';
    }
    if (!password) {
      errors.password = 'Password is required';
    }
    return errors;
  },
  onSubmit: ({ date, time, password, stakingOnly }) => {
    const now = new Date();
    let unlockDate = new Date(date);
    unlockDate = new Date(unlockDate.setMinutes(now.getTimezoneOffset()));
    unlockDate = new Date(unlockDate.setHours(time.slice(0, 2)));
    unlockDate = new Date(unlockDate.setMinutes(time.slice(3)));
    const unlockUntil = Math.round(
      (unlockDate.getTime() - now.getTime()) / 1000
    );

    return RPC.PROMISE('walletpassphrase', [
      password,
      unlockUntil,
      stakingOnly,
    ]);
  },
  onSubmitSuccess: async (result, dispatch) => {
    UIController.showNotification('Wallet unlocked', 'success');
    dispatch(getInfo());
  },
  onSubmitFail: (errors, dispatch, submitError) => {
    if (!errors || !Object.keys(errors).length) {
      let note = submitError || 'An unknown error occurred';
      if (
        submitError === 'Error: The wallet passphrase entered was incorrect.'
      ) {
        note = <Text id="Alert.IncorrectPasssword" />;
      } else if (submitError === 'value is type null, expected int') {
        note = <Text id="Alert.FutureDate" />;
      }
      UIController.openErrorDialog({
        message: 'Error unlocking wallet',
        note: note,
      });
    }
  },
})
export default class Login extends Component {
  getMinDate() {
    const today = new Date();
    let month = today.getMonth() + 1;
    if (month < 10) {
      month = '0' + month;
    }
    return `${today.getFullYear()}-${month}-${today.getDate()}`;
  }

  render() {
    const { handleSubmit, submitting } = this.props;
    return (
      <div>
        <form onSubmit={handleSubmit}>
          <LoginFieldSet legend="Login">
            <FormField connectLabel label="Unlock Until Date">
              <Field
                component={TextField.RF}
                name="date"
                type="date"
                min={this.getMinDate()}
              />
            </FormField>
            <FormField connectLabel label="Unlock Until Time">
              <Field component={TextField.RF} name="time" type="time" />
            </FormField>
            <FormField connectLabel label="Password">
              <Field
                component={TextField.RF}
                name="password"
                type="password"
                placeholder="Your wallet password"
              />
            </FormField>

            {/* STAKING FLAG STUFF  TURNED OFF UNTILL WE HAVE A FLAG COMING BACK FROM THE DAEMON TELLING US THAT ITS UNLOCKED FOR STAKING ONLY */}
            <FormField inline connectLabel label="Unlock for Staking Only">
              <Field component={Switch.RF} name="stakingOnly" />
            </FormField>

            <Buttons>
              <Button type="submit" skin="primary" disabled={submitting}>
                Unlock Wallet
              </Button>
            </Buttons>
          </LoginFieldSet>
        </form>
      </div>
    );
  }
}
