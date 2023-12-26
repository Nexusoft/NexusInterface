import Form from 'components/Form';
import ControlledModal from 'components/ControlledModal';
import InfoField from 'components/InfoField';
import Spinner from 'components/Spinner';
import { formSubmit } from 'lib/form';
import { confirmPin, openSuccessDialog } from 'lib/dialog';
import { loadAssets } from 'lib/user';
import { callApi } from 'lib/api';
import { getAssetData } from 'lib/asset';
import { assetNumberTypes } from 'consts/misc';
import memoize from 'utils/memoize';

__ = __context('EditAsset');

const getInitialValues = memoize((schema) =>
  schema
    .filter((field) => field.mutable)
    .reduce((values, field) => ({ ...values, [field.name]: field.value }), {})
);

export default function EditAssetModal({ schema, asset }) {
  const data = getAssetData(asset);

  return (
    <ControlledModal>
      {(closeModal) => (
        <>
          <ControlledModal.Header>{__('Edit asset')}</ControlledModal.Header>
          <ControlledModal.Body>
            <Form
              name="edit-asset"
              initialValues={getInitialValues(asset)}
              onSubmit={formSubmit({
                submit: async (values) => {
                  const pin = await confirmPin();

                  if (pin) {
                    return await callApi('assets/update/asset', {
                      pin,
                      address: asset.address,
                      ...values,
                    });
                  }
                },
                onSuccess: async (result, values, form) => {
                  if (!result) return; // Submission was cancelled
                  loadAssets();
                  form.restart();
                  closeModal();
                  openSuccessDialog({
                    message: __('Asset has been updated'),
                  });
                },
                errorMessage: __('Error updating asset'),
              })}
            >
              <InfoField label={__('Name')}>
                {asset.name || <span className="dim">N/A</span>}
              </InfoField>
              <InfoField label={__('Address')}>{asset.address}</InfoField>

              {Object.keys(data).map((fieldName) => {
                const field = schema.find((field) => field.name === fieldName);
                return (
                  <InfoField
                    key={fieldName}
                    label={fieldName}
                    style={{ alignItems: 'center' }}
                  >
                    {field?.mutable ? (
                      <Form.TextField
                        name={fieldName}
                        type={
                          assetNumberTypes.includes(field.type)
                            ? 'number'
                            : 'text'
                        }
                        min={
                          assetNumberTypes.includes(field.type) ? 0 : undefined
                        }
                        placeholder={fieldName}
                      />
                    ) : (
                      data[fieldName]
                    )}
                  </InfoField>
                );
              })}

              <div className="mt3 flex space-between">
                <div />
                <Form.SubmitButton skin="primary" wide uppercase>
                  {({ submitting }) =>
                    submitting ? (
                      <span>
                        <Spinner className="mr0_4" />
                        <span className="v-align">
                          {__('Updating asset')}...
                        </span>
                      </span>
                    ) : (
                      __('Update asset')
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
