import fs from 'fs';
import path from 'path';
import { randomInt } from 'crypto';
import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';
import { fade } from 'utils/color';
import { useSelector } from 'react-redux';
import { useRef, useEffect, useState } from 'react';

import Form from 'components/Form';
import ControlledModal from 'components/ControlledModal';
import FormField from 'components/FormField';
import TextField from 'components/TextField';
import Button from 'components/Button';
import Select from 'components/Select';
import Spinner from 'components/Spinner';
import { callAPI } from 'lib/api';
import { refreshProfileStatus } from 'lib/user';
import store from 'store';
import { SET_RECOVERY_PENDING } from 'consts/actionTypes';
import { formSubmit, checkAll, required, minChars } from 'lib/form';
import { openModal } from 'lib/ui';
import { openSuccessDialog, openErrorDialog } from 'lib/dialog';
import { assetsDir } from 'consts/paths';
import UT from 'lib/usageTracking';

__ = __context('SetRecoveryPhrase');

const options = [
  {
    value: 10,
    display: __('%{smart_count} word |||| %{smart_count} words', 10),
  },
  {
    value: 20,
    display: __('%{smart_count} word |||| %{smart_count} words', 20),
  },
  {
    value: 100,
    display: __('%{smart_count} word |||| %{smart_count} words', 100),
  },
];

const initialValues = {
  password: '',
  pin: '',
  phrase: '',
  newPhrase: '',
};

const RecoveryLayout = styled.div(({ theme }) => theme.modern ? {
  '.recovery-intro': { margin: '0 0 14px', fontSize: 12, lineHeight: 1.7, color: theme.mixer(0.7) },
  '.recovery-notice': { margin: '0 0 16px', padding: '12px 14px', borderRadius: 9, border: `1px solid ${fade(theme.danger, 0.35)}`, background: fade(theme.danger, 0.7), fontSize: 12, lineHeight: 1.6 },
  '.recovery-section': { padding: '16px 18px', marginBottom: 16, borderRadius: 12, border: `1px solid ${fade(theme.primary, 0.8)}`, background: fade(theme.primary, 0.97) },
  h3: { margin: '0 0 14px', fontSize: 12, fontWeight: 600, color: theme.primary },
  label: { fontSize: 12, textTransform: 'none', marginBottom: 8, color: theme.mixer(0.75) },
  '.recovery-input': { borderRadius: 8, minHeight: 40 },
  'input, textarea': { minWidth: 0, fontSize: 13, lineHeight: 1.6 },
  '.generator': { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' },
  '.word-count': { width: 120, height: 34, borderRadius: 8, fontSize: 12 },
  'button': { height: 34, borderRadius: 8, padding: '0 12px', fontSize: 12 },
  '.recovery-actions': { display: 'flex', justifyContent: 'flex-end', gap: 8, flexWrap: 'wrap', marginTop: 20 },
  '@media (max-width: 500px)': { '.recovery-section': { padding: 14 } },
} : {});

export default function SetRecoveryModal() {
  const { modern } = useTheme();
  const genesis = useSelector((state) => state.user.profileStatus?.genesis);
  const hasRecoveryPhrase = useSelector(
    ({ user: { profileStatus } }) => !!profileStatus?.recovery
  );
  const [wordCount, setWordCount] = useState(20);
  const wordlistRef = useRef(null);

  useEffect(() => {
    (async () => {
      const allWords = await fs.promises.readFile(
        path.join(assetsDir, 'misc', 'wordlist.txt')
      );
      wordlistRef.current = allWords
        .toString()
        .split('\n')
        .map((w) => w.trim())
        .filter((w) => w);
    })();
  }, []);

  return (
    <ControlledModal maxWidth={modern ? 760 : 500}>
      {(closeModal) => (
        <>
          <ControlledModal.Header>
            {__('Recovery phrase')}
          </ControlledModal.Header>
          <ControlledModal.Body>
            <RecoveryLayout>
            <Form
              name="set-recovery-phrase"
              initialValues={initialValues}
              onSubmit={formSubmit({
                submit: async ({ password, pin, phrase, newPhrase }) => {
                  const confirmed = await confirmRecovery(newPhrase);
                  if (confirmed) {
                    return await callAPI('profiles/update/recovery', {
                      password,
                      pin,
                      recovery: hasRecoveryPhrase ? phrase : undefined,
                      new_recovery: newPhrase,
                    });
                  }
                },
                onSuccess: (result) => {
                  if (!result) return;
                  if (!hasRecoveryPhrase) {
                    store.dispatch({ type: SET_RECOVERY_PENDING, payload: genesis });
                  }
                  UT.RecoverPhrase(hasRecoveryPhrase);
                  closeModal();
                  openSuccessDialog({
                    message: __('Recovery phrase has been updated'),
                  });
                  if (!hasRecoveryPhrase) {
                    refreshProfileStatus();
                  }
                },
                errorMessage: __('Error setting recovery phrase'),
              })}
            >
              <p className="recovery-intro">
                {__(
                  'The recovery phrase can be used to recover your account and set a new password and PIN in the event that you lose or forget them. Your recovery phrase must be a minimum of 40 characters, and should ideally be made up of random words.'
                )}
              </p>
              <p className="recovery-notice">
                {__(
                  '<b>Save your new recovery phrase in a safe place</b>, because if you lose it, there will be <b>no way</b> to recover it.',
                  null,
                  {
                    b: (text) => <strong>{text}</strong>,
                  }
                )}
              </p>

              <div className={modern ? 'recovery-section' : undefined}>
              {modern && <h3>{__('Current credentials')}</h3>}
              <FormField connectLabel label={__('Password')}>
                <Form.TextFieldWithKeyboard className="recovery-input" skin={modern ? 'filled-inverted' : 'underline'}
                  name="password"
                  maskable
                  placeholder={__('Your current password')}
                  validate={required()}
                />
              </FormField>

              <FormField connectLabel label={__('PIN')}>
                <Form.TextFieldWithKeyboard className="recovery-input" skin={modern ? 'filled-inverted' : 'underline'}
                  name="pin"
                  maskable
                  placeholder={__('Your current PIN')}
                  validate={required()}
                />
              </FormField>

              {hasRecoveryPhrase && (
                <FormField connectLabel label={__('Current recovery phrase')}>
                  <Form.TextField className="recovery-input" skin={modern ? 'filled-inverted' : 'underline'}
                    multiline
                    name="phrase"
                    placeholder={__('Enter your recovery phrase')}
                    rows={1}
                    validate={required()}
                  />
                </FormField>
              )}
              </div>

              <div className={modern ? 'recovery-section' : 'mt2'}>
                {modern && <h3>{__('New recovery phrase')}</h3>}
                <div className={modern ? 'generator' : 'mt1 flex center space-between'}>
                  <Form.Field name="newPhrase" subscription={{}}>
                    {({ input: { onChange } }) => (
                      <Button
                        skin={modern ? 'primary' : 'hyperlink'}
                        onClick={() => {
                          if (!wordlistRef.current) return;
                          const words = [];
                          for (let i = 0; i < wordCount; i++) {
                            const randomIndex = randomInt(wordlistRef.current.length);
                            words.push(wordlistRef.current[randomIndex]);
                          }
                          onChange(words.join(' '));
                        }}
                      >
                        {__('Generate a recovery phrase')}
                      </Button>
                    )}
                  </Form.Field>
                  <Select
                    className="word-count"
                    skin={modern ? 'filled-inverted' : 'underline'}
                    aria-label={__('Number of words')}
                    options={options}
                    value={wordCount}
                    onChange={(wordCount) => {
                      setWordCount(wordCount);
                    }}
                  />
                </div>

                <FormField connectLabel label={__('New recovery phrase')}>
                  <Form.TextField className="recovery-input" skin={modern ? 'filled-inverted' : 'underline'}
                    multiline
                    name="newPhrase"
                    placeholder={__(
                      'Enter your new recovery phrase or click Generate'
                    )}
                    rows={modern ? 3 : 1}
                    validate={checkAll(required(), minChars(40))}
                  />
                </FormField>
              </div>

              <div className={modern ? 'recovery-actions' : 'mt2'}>
                {modern && <Button type="button" onClick={closeModal}>{__('Cancel')}</Button>}
                <Form.SubmitButton skin={modern ? 'filled-primary' : 'primary'} wide={!modern}>
                  {({ submitting }) =>
                    submitting ? (
                      <span>
                        <Spinner className="mr0_4" />
                        <span className="v-align">
                          {__('Setting recovery phrase')}...
                        </span>
                      </span>
                    ) : (
                      __('Set recovery phrase')
                    )
                  }
                </Form.SubmitButton>
              </div>
            </Form>
            </RecoveryLayout>
          </ControlledModal.Body>
        </>
      )}
    </ControlledModal>
  );
}

function ConfirmRecoveryDialog({ phrase, onConfirm, ...rest }) {
  const { modern } = useTheme();
  const [inputValue, setInputValue] = useState('');
  return (
    <ControlledModal maxWidth={500} {...rest}>
      {(closeModal) => (
        <>
          <ControlledModal.Header>
            {__('Confirm recovery phrase')}
          </ControlledModal.Header>
          <ControlledModal.Body>
            <RecoveryLayout>
            <TextField
              className="recovery-input"
              skin={modern ? 'filled-inverted' : 'underline'}
              aria-label={__('Confirm recovery phrase')}
              multiline
              rows={modern ? 3 : 1}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
              }}
              autoFocus
              placeholder={__('Enter your new recovery phrase again')}
            />
            <div className={modern ? 'recovery-actions' : 'flex space-between mt2'}>
              <Button onClick={closeModal}>{__('Cancel')}</Button>
              <Button
                type="submit"
                skin={modern ? 'filled-primary' : 'primary'}
                onClick={() => {
                  if (inputValue !== phrase) {
                    openErrorDialog({
                      message: __(
                        "Recovery phrase confirmation doesn't match!"
                      ),
                      note: __(
                        'Please make sure that you have a good backup of your recovery phrase and try again.'
                      ),
                    });
                  } else {
                    onConfirm?.();
                    closeModal();
                  }
                }}
              >
                {__('Confirm')}
              </Button>
            </div>
            </RecoveryLayout>
          </ControlledModal.Body>
        </>
      )}
    </ControlledModal>
  );
}

async function confirmRecovery(phrase) {
  return new Promise((resolve) => {
    openModal(ConfirmRecoveryDialog, {
      phrase,
      onClose: () => {
        resolve(false);
      },
      onConfirm: () => {
        resolve(true);
      },
    });
  });
}
