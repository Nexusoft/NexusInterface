import styled from '@emotion/styled';

import Form from 'components/Form';
import ControlledModal from 'components/ControlledModal';
import FormField from 'components/FormField';
import Spinner from 'components/Spinner';
import { formSubmit, required } from 'lib/form';
import { confirmPin, openSuccessDialog } from 'lib/dialog';
import { refreshAssets } from 'lib/user';
import { callAPI } from 'lib/api';
import { userIdRegex } from 'consts/misc';

__ = __context('TransferAsset');

const Value = styled.span(({ theme }) => ({
  color: theme.foreground,
}));

const initialValues = {
  recipient: '',
};

export default function TransferAssetModal({ asset }) {
  return (
    <ControlledModal maxWidth={600}>
      {(closeModal) => (
        <>
          <ControlledModal.Header>
            {__('Transfer asset')}
          </ControlledModal.Header>
          <ControlledModal.Body>
            <Form
              name="transfer-asset"
              initialValues={initialValues}
              onSubmit={formSubmit({
                submit: async ({ recipient }) => {
                  const pin = await confirmPin();

                  const params = { pin, address: asset.address };
                  if (userIdRegex.test(recipient)) {
                    params.destination = recipient;
                  } else {
                    params.username = recipient;
                  }

                  if (pin) {
                    return await callAPI('assets/transfer/asset', params);
                  }
                },
                onSuccess: async (result) => {
                  if (!result) return; // Submission was cancelled
                  refreshAssets();
                  closeModal();
                  openSuccessDialog({
                    message: __('Asset has been transferred'),
                  });
                },
                errorMessage: __('Error transferring asset'),
              })}
            >
              <FormField label={__('Asset name')}>
                <Value>{asset.name}</Value>
              </FormField>

              <FormField label={__('Asset address')}>
                <Value>{asset.address}</Value>
              </FormField>

              <FormField connectLabel label={__('Transfer to')}>
                <Form.TextField
                  name="recipient"
                  autoFocus
                  placeholder={__('Recipient username or user ID')}
                  validate={required()}
                />
              </FormField>

              <Form.SubmitButton skin="primary" wide uppercase className="mt3">
                {({ submitting }) =>
                  submitting ? (
                    <span>
                      <Spinner className="mr0_4" />
                      <span className="v-align">
                        {__('Transferring asset')}...
                      </span>
                    </span>
                  ) : (
                    __('Transfer asset')
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
