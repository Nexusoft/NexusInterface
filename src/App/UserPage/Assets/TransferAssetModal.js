import React from 'react';
import { reduxForm, Field } from 'redux-form';
import styled from '@emotion/styled';

import Modal from 'components/Modal';
import Button from 'components/Button';
import FormField from 'components/FormField';
import TextField from 'components/TextField';
import Spinner from 'components/Spinner';
import confirmPin from 'utils/promisified/confirmPin';
import { errorHandler } from 'utils/form';
import { openSuccessDialog } from 'lib/ui';
import { loadAssets } from 'lib/user';
import { apiPost } from 'lib/tritiumApi';
import { userIdRegex } from 'consts/misc';

__ = __context('TransferAsset');

const Value = styled.span(({ theme }) => ({
  color: theme.foreground,
}));

@reduxForm({
  form: 'transfer-asset',
  destroyOnUnmount: true,
  initialValues: {
    recipient: '',
  },
  validate: ({ recipient }) => {
    const errors = {};
    if (!recipient) {
      errors.recipient = __('Recipient is required');
    }
    return errors;
  },
  onSubmit: async ({ recipient }, dispatch, { asset }) => {
    const pin = await confirmPin();

    const params = { pin, address: asset.address };
    if (userIdRegex.test(recipient)) {
      params.destination = recipient;
    } else {
      params.username = recipient;
    }

    if (pin) {
      return await apiPost('assets/transfer/asset', params);
    }
  },
  onSubmitSuccess: async (result, dispatch, props) => {
    if (!result) return; // Submission was cancelled
    loadAssets();
    props.closeModal();
    openSuccessDialog({
      message: __('Asset has been transferred'),
    });
  },
  onSubmitFail: errorHandler(__('Error transferring asset')),
})
class TransferAssetForm extends React.Component {
  render() {
    const { handleSubmit, asset, submitting } = this.props;
    return (
      <form onSubmit={handleSubmit}>
        <FormField label={__('Asset name')}>
          <Value>{asset.name}</Value>
        </FormField>

        <FormField label={__('Asset address')}>
          <Value>{asset.address}</Value>
        </FormField>

        <FormField connectLabel label={__('Transfer to')}>
          <Field
            name="recipient"
            autoFocus
            component={TextField.RF}
            placeholder={__('Recipient username or user ID')}
          />
        </FormField>

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
              <Spinner className="space-right" />
              <span className="v-align">{__('Transferring asset')}...</span>
            </span>
          ) : (
            __('Transfer asset')
          )}
        </Button>
      </form>
    );
  }
}

const TransferAssetModal = ({ asset }) => (
  <Modal maxWidth={600}>
    {closeModal => (
      <>
        <Modal.Header>{__('Transfer asset')}</Modal.Header>
        <Modal.Body>
          <TransferAssetForm closeModal={closeModal} asset={asset} />
        </Modal.Body>
      </>
    )}
  </Modal>
);

export default TransferAssetModal;
