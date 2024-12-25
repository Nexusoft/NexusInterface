import fs from 'fs';
import path from 'path';
import { useAtomValue } from 'jotai';
import { useRef, useEffect, useState } from 'react';

import Form from 'components/Form';
import ControlledModal from 'components/ControlledModal';
import FormField from 'components/FormField';
import TextField from 'components/TextField';
import Button from 'components/Button';
import Select from 'components/Select';
import Spinner from 'components/Spinner';
import { callAPI } from 'lib/api';
import { loadProfileStatus, hasRecoveryPhraseAtom } from 'lib/session';
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

export default function SetRecoveryModal() {
  const hasRecoveryPhrase = useAtomValue(hasRecoveryPhraseAtom);
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
    <ControlledModal maxWidth={500}>
      {(closeModal) => (
        <>
          <ControlledModal.Header>
            {__('Recovery phrase')}
          </ControlledModal.Header>
          <ControlledModal.Body>
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
                  UT.RecoverPhrase(hasRecoveryPhrase);
                  closeModal();
                  openSuccessDialog({
                    message: __('Recovery phrase has been updated'),
                  });
                  if (!hasRecoveryPhrase) {
                    loadProfileStatus();
                  }
                },
                errorMessage: __('Error setting recovery phrase'),
              })}
            >
              <p>
                {__(
                  'The recovery phrase can be used to recover your account and set a new password and PIN in the event that you lose or forget them. Your recovery phrase must be a minimum of 40 characters, and should ideally be made up of random words.'
                )}
              </p>
              <p>
                {__(
                  '<b>Securely store your new recovery phrase in a safe and accessible location, as it cannot be recovered if lost.</b>',
                  null,
                  {
                    b: (text) => <strong>{text}</strong>,
                  }
                )}{' '}
                {__(
                  'In the next step, you will be prompted to re-enter it to confirm you have recorded it accurately.'
                )}
              </p>

              <FormField label={__('Password')}>
                <Form.TextFieldWithKeyboard
                  name="password"
                  maskable
                  placeholder={__('Your current password')}
                  validate={required()}
                />
              </FormField>

              <FormField label={__('PIN')}>
                <Form.TextFieldWithKeyboard
                  name="pin"
                  maskable
                  placeholder={__('Your current PIN')}
                  validate={required()}
                />
              </FormField>

              {hasRecoveryPhrase && (
                <FormField label={__('Current recovery phrase')}>
                  <Form.TextField
                    multiline
                    name="phrase"
                    placeholder={__('Enter your recovery phrase')}
                    rows={1}
                    validate={required()}
                  />
                </FormField>
              )}

              <div className="mt2">
                <div className="mt1 flex center space-between">
                  <Form.Field name="newPhrase" subscription={{}}>
                    {({ input: { onChange } }) => (
                      <Button
                        skin="hyperlink"
                        onClick={() => {
                          if (!wordlistRef.current) return;
                          const words = [];
                          for (let i = 0; i < wordCount; i++) {
                            const randomIndex = Math.floor(
                              Math.random() * wordlistRef.current.length
                            );
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
                    options={options}
                    value={wordCount}
                    onChange={(wordCount) => {
                      setWordCount({ wordCount });
                    }}
                  />
                </div>

                <FormField label={__('New recovery phrase')}>
                  <Form.TextField
                    multiline
                    name="newPhrase"
                    placeholder={__(
                      'Enter your new recovery phrase or click Generate'
                    )}
                    rows={1}
                    validate={checkAll(required(), minChars(8))}
                  />
                </FormField>
              </div>

              <div className="mt2">
                <Form.SubmitButton skin="primary" wide>
                  {({ submitting }) =>
                    submitting ? (
                      <span>
                        <Spinner className="mr0_4" />
                        <span className="v-align">
                          {__('Setting recovery phrase')}...
                        </span>
                      </span>
                    ) : (
                      __('Next')
                    )
                  }
                </Form.SubmitButton>
              </div>
            </Form>
          </ControlledModal.Body>
        </>
      )}
    </ControlledModal>
  );
}

function ConfirmRecoveryDialog({ phrase, onConfirm, ...rest }) {
  const [inputValue, setInputValue] = useState('');
  return (
    <ControlledModal maxWidth={500} {...rest}>
      {(closeModal) => (
        <>
          <ControlledModal.Header>
            {__('Confirm recovery phrase')}
          </ControlledModal.Header>
          <ControlledModal.Body>
            <TextField
              multiline
              rows={1}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
              }}
              autoFocus
              placeholder={__('Enter your new recovery phrase again')}
            />
            <div className="flex space-between mt2">
              <Button onClick={closeModal}>{__('Cancel')}</Button>
              <Button
                type="submit"
                skin="primary"
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
