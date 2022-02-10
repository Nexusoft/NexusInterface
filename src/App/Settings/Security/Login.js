// External Dependencies
import styled from '@emotion/styled';
import { useSelector } from 'react-redux';

// Internal Dependencies
import Form from 'components/Form';
import FormField from 'components/FormField';
import FieldSet from 'components/FieldSet';
import { formSubmit, required, checkAll, useFieldValue } from 'lib/form';
import { refreshCoreInfo } from 'lib/coreInfo';
import rpc from 'lib/rpc';
import { showNotification } from 'lib/ui';

__ = __context('Settings.Security');

const LoginFieldSet = styled(FieldSet)({
  maxWidth: 400,
  margin: '0 auto',
});

const Buttons = styled.div({
  display: 'flex',
  justifyContent: 'flex-end',
  marginTop: '1.5em',
});

const initialValues = {
  date: null,
  time: null,
  password: '',
  stakingOnly: false,
  setLoginTimeOut: false,
};

function timeInFuture(date, { time }) {
  if (date && time) {
    let unlockUntil = 0;
    const now = new Date();
    let unlockDate = new Date(date);
    unlockDate = new Date(unlockDate.setMinutes(now.getTimezoneOffset()));
    unlockDate = new Date(unlockDate.setHours(time.slice(0, 2)));
    unlockDate = new Date(unlockDate.setMinutes(time.slice(3)));
    unlockUntil = Math.round((unlockDate.getTime() - now.getTime()) / 1000);

    if (unlockUntil < 3600) {
      return __('Time must be at least one hour in the future');
    }
  }
}

function AdvancedSection() {
  const tritium = useSelector(
    (state) =>
      state.core.info.version.includes('0.3') ||
      parseFloat(state.core.info.version) >= 3
  );
  const stakingOnly = useFieldValue('stakingOnly');
  const setLoginTimeOut = useFieldValue('setLoginTimeOut');
  return (
    <>
      <FormField
        inline
        connectLabel
        label={__('Login for staking & mining only')}
      >
        <Form.Switch name="stakingOnly" />
      </FormField>
      {tritium && (
        <FormField inline connectLabel label={__('Set timeout for login')}>
          <Form.Switch name="setLoginTimeOut" disabled={!!stakingOnly} />
        </FormField>
      )}
      {!stakingOnly && (!tritium || setLoginTimeOut) && (
        <div>
          <FormField connectLabel label={__('Login until date')}>
            <Form.TextField
              name="date"
              type="date"
              min={new Date().toISOString().slice(0, 10)}
              validate={checkAll(required(), timeInFuture)}
            />
          </FormField>
          <FormField connectLabel label={__('Login until time')}>
            <Form.TextField name="time" type="time" validate={required()} />
          </FormField>
        </div>
      )}
    </>
  );
}

export default function Login() {
  return (
    <Form
      name="login"
      persistState
      initialValues={initialValues}
      onSubmit={formSubmit({
        submit: ({ date, time, password, stakingOnly }) => {
          let unlockUntil = 0;

          if (date && time && !stakingOnly) {
            const now = new Date();
            let unlockDate = new Date(date);
            unlockDate = new Date(
              unlockDate.setMinutes(now.getTimezoneOffset())
            );
            unlockDate = new Date(unlockDate.setHours(time.slice(0, 2)));
            unlockDate = new Date(unlockDate.setMinutes(time.slice(3)));
            unlockUntil = Math.round(
              (unlockDate.getTime() - now.getTime()) / 1000
            );
          }

          return rpc('walletpassphrase', [password, unlockUntil, stakingOnly]);
        },
        onSuccess: async (result, values, form) => {
          form.restart();
          showNotification(__('Logged in successfully'), 'success');
          refreshCoreInfo();
        },
        errorMessage: __('Error logging in'),
      })}
    >
      <LoginFieldSet legend="Login">
        <FormField connectLabel label={__('Password')}>
          <Form.TextField
            name="password"
            type="password"
            placeholder={__('Your wallet password')}
            validate={required()}
          />
        </FormField>
        <AdvancedSection />

        <Buttons>
          <Form.SubmitButton skin="primary">{__('Log in')}</Form.SubmitButton>
        </Buttons>
      </LoginFieldSet>
    </Form>
  );
}
