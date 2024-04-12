import { useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import styled from '@emotion/styled';

import ControlledModal from 'components/ControlledModal';
import Form from 'components/Form';
import FormField from 'components/FormField';
import Spinner from 'components/Spinner';
import { formSubmit } from 'lib/form';
import { confirmPin, openSuccessDialog } from 'lib/dialog';
import { refreshNameRecords } from 'lib/user';
import { selectUsername } from 'lib/session';
import { callAPI } from 'lib/api';
import memoize from 'utils/memoize';

__ = __context('ChangeRegisterAddress');

const Prefix = styled.span(({ theme }) => ({
  color: theme.mixer(0.5),
}));

const Name = styled.span(({ theme }) => ({
  color: theme.foreground,
}));

const getInitialValues = memoize((registerAddress) => ({
  registerAddress,
}));

export default function ChangeRegisterAddressModal({ nameRecord }) {
  const username = useSelector(selectUsername);
  const inputRef = useRef();
  useEffect(() => {
    setTimeout(() => {
      // Select all register address
      inputRef.current?.select();
    }, 0);
  }, []);

  return (
    <ControlledModal maxWidth={600}>
      {(closeModal) => (
        <>
          <ControlledModal.Header>
            {__('Change register address')}
          </ControlledModal.Header>
          <ControlledModal.Body>
            <Form
              name="change-register-address"
              initialValues={getInitialValues(nameRecord.register)}
              onSubmit={formSubmit({
                submit: async ({ registerAddress }) => {
                  const pin = await confirmPin();
                  if (pin) {
                    return await callAPI('names/update/name', {
                      pin,
                      address: nameRecord.address,
                      register: registerAddress,
                    });
                  }
                },
                onSuccess: async (result) => {
                  if (!result) return; // Submission was cancelled
                  refreshNameRecords();
                  closeModal();
                  openSuccessDialog({
                    message: __('Name has been updated'),
                  });
                },
                errorMessage: __('Error updating name'),
              })}
            >
              <FormField label={__('Name')}>
                {nameRecord.global ? null : nameRecord.namespace ? (
                  <Prefix>{nameRecord.namespace + '::'}</Prefix>
                ) : (
                  <Prefix>{username + ':'}</Prefix>
                )}
                <Name>{nameRecord.name}</Name>
              </FormField>

              <FormField connectLabel label={__('Register address')}>
                <Form.TextField
                  inputRef={inputRef}
                  name="registerAddress"
                  placeholder={__('Register address that this name points to')}
                />
              </FormField>

              <div className="mt1" style={{ textAlign: 'left' }}>
                {__('Name update fee')}: 1 NXS
              </div>

              <Form.SubmitButton skin="primary" wide uppercase className="mt3">
                {({ submitting }) =>
                  submitting ? (
                    <span>
                      <Spinner className="mr0_4" />
                      <span className="v-align">{__('Updating name')}...</span>
                    </span>
                  ) : (
                    __('Update name')
                  )
                }
              </Form.SubmitButton>
            </Form>
          </ControlledModal.Body>
        </>
      )}
    </ControlledModal>
  );
}
