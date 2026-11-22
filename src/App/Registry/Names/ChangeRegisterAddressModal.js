import { useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import styled from '@emotion/styled';

import ControlledModal from 'components/ControlledModal';
import Form from 'components/Form';
import FormField from 'components/FormField';
import Spinner from 'components/Spinner';
import Button from 'components/Button';
import RegistryIcon from '../RegistryIcon';
import { fade } from 'utils/color';
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

const Heading = styled.div(({ theme }) => ({
  display: 'flex', alignItems: 'center', gap: 14,
  '.heading-icon': { width: 44, height: 44, display: 'grid', placeItems: 'center', flexShrink: 0, borderRadius: 12, background: fade(theme.primary, 0.9), color: theme.primary },
  h2: { margin: 0, fontSize: 20, fontWeight: 500, lineHeight: 1.4 },
  p: { margin: '5px 0 0', fontSize: 12, lineHeight: 1.6, color: theme.mixer(0.65) },
}));

const Editor = styled.div(({ theme }) => ({
  '.name-summary': { display: 'flex', alignItems: 'center', gap: 16, padding: '16px 18px', borderRadius: 12, border: `1px solid ${fade(theme.primary, 0.8)}`, background: fade(theme.primary, 0.96), marginBottom: 24 },
  '.name-label': { fontSize: 11, color: theme.mixer(0.65), flexShrink: 0 },
  '.name-value': { marginLeft: 'auto', minWidth: 0, fontSize: 15, overflowWrap: 'anywhere', textAlign: 'right' },
  '.address-field': { marginTop: 0 },
  '.address-field label': { marginBottom: 10, fontSize: 12 },
  '.address-field input': { fontFamily: 'Consolas, monospace', fontSize: 13 },
  '.hint': { margin: '10px 0 20px', fontSize: 12, lineHeight: 1.6, color: theme.mixer(0.6) },
  '.fee': { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '14px 16px', borderRadius: 10, background: fade(theme.foreground, 0.96), fontSize: 12, color: theme.mixer(0.7) },
  '.fee strong': { color: theme.foreground, fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap' },
  '.actions': { display: 'flex', justifyContent: 'flex-end', gap: 10, flexWrap: 'wrap', marginTop: 24, paddingTop: 20, borderTop: `1px solid ${fade(theme.primary, 0.85)}` },
  '.actions button': { minHeight: 42 },
  '@media (max-width: 480px)': { '.actions button': { flex: 1 } },
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
    <ControlledModal maxWidth={660}>
      {(closeModal) => (
        <>
          <ControlledModal.Header>
            <Heading><span className="heading-icon"><RegistryIcon section="Names" size={24} /></span><div><h2>{__('Change register address')}</h2><p>{__('Choose the register this name points to.')}</p></div></Heading>
          </ControlledModal.Header>
          <ControlledModal.Body>
            <Editor>
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
              <div className="name-summary"><span className="name-label">{__('Name')}</span><div className="name-value">
                {nameRecord.global ? null : nameRecord.namespace ? (
                  <Prefix>{nameRecord.namespace + '::'}</Prefix>
                ) : (
                  <Prefix>{username + ':'}</Prefix>
                )}
                <Name>{nameRecord.name}</Name>
              </div></div>

              <FormField className="address-field" connectLabel label={__('Register address')}>
                <Form.TextField
                  inputRef={inputRef}
                  aria-describedby="register-address-hint"
                  autoComplete="off"
                  spellCheck={false}
                  name="registerAddress"
                  placeholder={__('Register address that this name points to')}
                />
              </FormField>

              <p className="hint" id="register-address-hint">{__('Enter the full register address to link to this name.')}</p>
              <div className="fee"><span>{__('Name update fee')}</span><strong>1 NXS</strong></div>

              <div className="actions">
              <Button type="button" skin="primary" onClick={closeModal}>{__('Cancel')}</Button>
              <Form.SubmitButton skin="filled-primary">
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
              </div>
            </Form>
            </Editor>
          </ControlledModal.Body>
        </>
      )}
    </ControlledModal>
  );
}
