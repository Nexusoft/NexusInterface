import { useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import styled from '@emotion/styled';

import ControlledModal from 'components/ControlledModal';
import Button from 'components/Button';
import FormField from 'components/FormField';
import TextField from 'components/TextField';
import Spinner from 'components/Spinner';
import { confirmPin, openSuccessDialog } from 'lib/dialog';
import { errorHandler } from 'utils/form';
import { loadNameRecords, selectUsername } from 'lib/user';
import { callApi } from 'lib/tritiumApi';

__ = __context('ChangeRegisterAddress');

const Prefix = styled.span(({ theme }) => ({
  color: theme.mixer(0.5),
}));

const Name = styled.span(({ theme }) => ({
  color: theme.foreground,
}));

const formOptions = {
  form: 'change-register-address',
  destroyOnUnmount: true,
  onSubmit: async ({ registerAddress }, dispatch, { nameRecord }) => {
    const pin = await confirmPin();

    if (pin) {
      return await callApi('names/update/name', {
        pin,
        address: nameRecord.address,
        register: registerAddress,
      });
    }
  },
  onSubmitSuccess: async (result, dispatch, props) => {
    if (!result) return; // Submission was cancelled
    loadNameRecords();
    props.closeModal();
    openSuccessDialog({
      message: __('Name has been updated'),
    });
  },
  onSubmitFail: errorHandler(__('Error updating name')),
};

function ChangeRegisterAddressForm({ handleSubmit, nameRecord, submitting }) {
  const username = useSelector(selectUsername);
  const inputRef = useRef();
  useEffect(() => {
    setTimeout(() => {
      // Select all register address
      inputRef.current?.select();
    }, 0);
  }, []);

  return (
    <form onSubmit={handleSubmit}>
      <FormField label={__('Name')}>
        {nameRecord.global ? null : nameRecord.namespace ? (
          <Prefix>{nameRecord.namespace + '::'}</Prefix>
        ) : (
          <Prefix>{username + ':'}</Prefix>
        )}
        <Name>{nameRecord.name}</Name>
      </FormField>

      <FormField connectLabel label={__('Register address')}>
        <Field
          inputRef={this.inputRef}
          name="registerAddress"
          component={TextField.RF}
          placeholder={__('Register address that this name points to')}
        />
      </FormField>

      <div className="mt1" style={{ textAlign: 'left' }}>
        {__('Name update fee')}: 1 NXS
      </div>

      <Button
        skin="primary"
        wide
        uppercase
        className="mt3"
        type="submit"
        disabled={submitting}
      >
        {submitting ? (
          <span>
            <Spinner className="mr0_4" />
            <span className="v-align">{__('Updating name')}...</span>
          </span>
        ) : (
          __('Update name')
        )}
      </Button>
    </form>
  );
}

ChangeRegisterAddressForm = reduxForm(formOptions)(ChangeRegisterAddressForm);

export default function ChangeRegisterAddressModal({ nameRecord }) {
  return (
    <ControlledModal maxWidth={600}>
      {(closeModal) => (
        <>
          <ControlledModal.Header>
            {__('Change register address')}
          </ControlledModal.Header>
          <ControlledModal.Body>
            <ChangeRegisterAddressForm
              closeModal={closeModal}
              nameRecord={nameRecord}
              initialValues={{
                registerAddress: nameRecord.register,
              }}
            />
          </ControlledModal.Body>
        </>
      )}
    </ControlledModal>
  );
}
