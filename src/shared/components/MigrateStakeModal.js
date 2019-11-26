import React from 'react';
import { reduxForm, Field } from 'redux-form';
import styled from '@emotion/styled';

import Modal from 'components/Modal';
import MaskableTextField from 'components/MaskableTextField';
import FormField from 'components/FormField';
import Button from 'components/Button';
import confirmPin from 'utils/promisified/confirmPin';
import { removeModal, openSuccessDialog } from 'lib/ui';
import { apiPost } from 'lib/tritiumApi';
import { errorHandler } from 'utils/form';
import { returnCoreDataDir } from 'consts/paths';

const PasswordInput = styled(MaskableTextField.RF)({
  margin: '1em auto 2.5em',
});

const formOptions = {
  form: 'migrate_stake',
  destroyOnUnmount: true,
  initialValues: {
    passphrase: '',
  },
  onSubmit: async ({ passphrase }) => {
    const pin = await confirmPin();
    if (pin) {
      return await apiPost('finance/migrate/stake', {
        pin,
        walletpassphrase: passphrase,
      });
    }
  },
  onSubmitSuccess: (result, dispatch, props) => {
    if (!result) return;

    removeModal(props.modalId);
    openSuccessDialog({
      message: __('Your stake has been successfully migrated'),
    });
  },
  onSubmitFail: errorHandler(__('Error migrating stake')),
};

const MigrateStakeModal = ({ handleSubmit }) => (
  <Modal style={{ maxWidth: 600 }}>
    {closeModal => (
      <>
        <Modal.Header>{__('Migrate stake')}</Modal.Header>
        <Modal.Body>
          <div>
            {__(
              'This will transfer all stake amount and trust score from your legacy wallet to your new Tritium account.'
            )}
          </div>
          <div className="mt1">
            {__(
              'Please make sure that you are using the same machine that you used to stake with your legacy wallet, or you have put your staking wallet.dat file into %{path}',
              { path: returnCoreDataDir() }
            )}
          </div>
          <form onSubmit={handleSubmit} className="mt2">
            <FormField connectLabel label={__('Legacy wallet password')}>
              <Field
                component={PasswordInput}
                name="passphrase"
                skin="filled-inverted"
                placeholder={__(
                  'Leave this blank if your legacy wallet is not encrypted'
                )}
                autoFocus
              />
            </FormField>
            <div className="flex space-between">
              <Button onClick={closeModal}>{__('Cancel')}</Button>
              <Button type="submit" skin="primary">
                {__('Migrate stake')}
              </Button>
            </div>
          </form>
        </Modal.Body>
      </>
    )}
  </Modal>
);

export default reduxForm(formOptions)(MigrateStakeModal);
