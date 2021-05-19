import { Component } from 'react';
import { reduxForm, Field } from 'redux-form';
import styled from '@emotion/styled';

import ControlledModal from 'components/ControlledModal';
import Button from 'components/Button';
import FormField from 'components/FormField';
import TextField from 'components/TextField';
import Spinner from 'components/Spinner';
import { confirmPin, openSuccessDialog } from 'lib/dialog';
import { errorHandler } from 'utils/form';
import { loadAssets } from 'lib/user';
import { callApi } from 'lib/tritiumApi';
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
      return await callApi('assets/transfer/asset', params);
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
class TransferAssetForm extends Component {
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
              <Spinner className="mr0_4" />
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
  <ControlledModal maxWidth={600}>
    {(closeModal) => (
      <>
        <ControlledModal.Header>{__('Transfer asset')}</ControlledModal.Header>
        <ControlledModal.Body>
          <TransferAssetForm closeModal={closeModal} asset={asset} />
        </ControlledModal.Body>
      </>
    )}
  </ControlledModal>
);

export default TransferAssetModal;
