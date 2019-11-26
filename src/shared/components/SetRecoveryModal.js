import fs from 'fs';
import path from 'path';
import { connect } from 'react-redux';
import React from 'react';
import { reduxForm, Field } from 'redux-form';

import { apiPost } from 'lib/tritiumApi';
import Modal from 'components/Modal';
import FormField from 'components/FormField';
import TextField from 'components/TextField';
import MaskableTextField from 'components/MaskableTextField';
import Button from 'components/Button';
import Select from 'components/Select';
import Spinner from 'components/Spinner';
import { errorHandler, numericOnly } from 'utils/form';
import { openSuccessDialog, removeModal } from 'lib/ui';
import { assetsDir } from 'consts/paths';

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

@connect(({ core: { userStatus } }) => ({
  hasRecoveryPhrase: !!(userStatus && userStatus.recovery),
}))
@reduxForm({
  form: 'set-recovery-phrase',
  destroyOnUnmount: true,
  initialValues: {
    password: '',
    pin: '',
    phrase: '',
    newPhrase: '',
  },
  validate: ({ password, pin, phrase, newPhrase }, props) => {
    const errors = {};

    if (!password) {
      errors.password = __('Password is required');
    }

    if (!pin) {
      errors.pin = __('PIN is required');
    }

    if (props.hasRecoveryPhrase && !phrase) {
      errors.phrase = __('Current recovery phrase is required');
    }

    if (!newPhrase) {
      errors.newPhrase = __('Recovery phrase is required');
    } else if (newPhrase.length < 8) {
      errors.newPhrase = __('Recovery phrase must be at least 40 characters');
    }

    return errors;
  },
  onSubmit: ({ password, pin, phrase, newPhrase }, dispatch, props) =>
    apiPost('users/update/user', {
      password,
      pin,
      recovery: props.hasRecoveryPhrase ? phrase : undefined,
      new_recovery: newPhrase,
    }),
  onSubmitSuccess: async (result, dispatch, props) => {
    removeModal(props.modalId);
    props.reset();
    openSuccessDialog({
      message: __('Recovery phrase has been updated'),
    });
  },
  onSubmitFail: errorHandler(__('Error setting recovery phrase')),
})
export default class SetRecoveryModal extends React.Component {
  state = {
    wordCount: 20,
  };

  wordlist = null;

  async componentDidMount() {
    const allWords = await fs.promises.readFile(
      path.join(assetsDir, 'misc', 'wordlist.txt')
    );
    this.wordlist = allWords
      .toString()
      .split('\n')
      .map(w => w.trim())
      .filter(w => w);
  }

  generatePhrase = () => {
    if (!this.wordlist) return;
    const words = [];
    for (let i = 0; i < this.state.wordCount; i++) {
      const randomIndex = Math.floor(Math.random() * this.wordlist.length);
      words.push(this.wordlist[randomIndex]);
    }
    this.props.change('newPhrase', words.join(' '));
  };

  render() {
    const { handleSubmit, submitting } = this.props;
    return (
      <Modal
        assignClose={closeModal => (this.closeModal = closeModal)}
        style={{ maxWidth: 500 }}
      >
        <Modal.Header>{__('Recovery phrase')}</Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <div>
              {__(
                'Save this new recovery phrase in a safe place. You will be able to use it to change your password and PIN, even reset your recovery phrase in the future.'
              )}
            </div>

            <FormField label={__('Password')}>
              <Field
                name="password"
                component={MaskableTextField.RF}
                placeholder={__('Your current password')}
              />
            </FormField>

            <FormField label={__('PIN')}>
              <Field
                name="pin"
                component={MaskableTextField.RF}
                normalize={numericOnly}
                placeholder={__('Your current PIN number')}
              />
            </FormField>

            {this.props.hasRecoveryPhrase && (
              <FormField label={__('Current recovery phrase')}>
                <Field
                  multiline
                  name="phrase"
                  component={TextField.RF}
                  placeholder={__('Enter your recovery phrase')}
                  rows={1}
                />
              </FormField>
            )}

            <div className="mt2">
              <FormField label={__('New recovery phrase')}>
                <Field
                  multiline
                  name="newPhrase"
                  component={TextField.RF}
                  placeholder={__(
                    'Enter your new recovery phrase or click Generate'
                  )}
                  rows={1}
                />
              </FormField>

              <div className="mt1 flex center space-between">
                <Button skin="hyperlink" onClick={this.generatePhrase}>
                  {__('Generate a recovery phrase')}
                </Button>
                <Select
                  options={options}
                  value={this.state.wordCount}
                  onChange={wordCount => {
                    this.setState({ wordCount });
                  }}
                />
              </div>
            </div>

            <div className="mt2">
              <Button skin="primary" wide type="submit" disabled={submitting}>
                {submitting ? (
                  <span>
                    <Spinner className="space-right" />
                    <span className="v-align">
                      {__('Setting recovery phrase')}...
                    </span>
                  </span>
                ) : (
                  __('Set recovery phrase')
                )}
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    );
  }
}
