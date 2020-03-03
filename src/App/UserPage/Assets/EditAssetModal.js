import React from 'react';
import { reduxForm, Field } from 'redux-form';

import Modal from 'components/Modal';
import Button from 'components/Button';
import InfoField from 'components/InfoField';
import TextField from 'components/TextField';
import Spinner from 'components/Spinner';
import confirmPin from 'utils/promisified/confirmPin';
import { errorHandler } from 'utils/form';
import { openSuccessDialog } from 'lib/ui';
import { loadAssets } from 'lib/user';
import { apiPost } from 'lib/tritiumApi';
import { assetNumberTypes } from 'consts/misc';

__ = __context('EditAsset');

const createInitialField = () => ({
  name: '',
  value: '',
  mutable: false,
  type: 'string',
  maxlength: null,
});

@reduxForm({
  form: 'edit-asset',
  destroyOnUnmount: true,
  onSubmit: async (values, dispatch, props) => {
    const pin = await confirmPin();

    if (pin) {
      return await apiPost('assets/update/asset', {
        pin,
        address: props.asset.address,
        ...values,
      });
    }
  },
  onSubmitSuccess: async (result, dispatch, props) => {
    if (!result) return; // Submission was cancelled
    loadAssets();
    props.reset();
    props.closeModal();
    openSuccessDialog({
      message: __('Asset has been updated'),
    });
  },
  onSubmitFail: errorHandler(__('Error updating asset')),
})
class EditAssetForm extends React.Component {
  constructor(props) {
    super(props);
  }

  addField = () => {
    this.props.array.push('fields', createInitialField());
  };

  removeField = index => {
    this.props.array.remove('fields', index);
  };

  render() {
    const { handleSubmit, submitting, mutableFields, asset } = this.props;
    return (
      <form onSubmit={handleSubmit}>
        <InfoField label={__('Name')}>
          {asset.name || <span className="dim">N/A</span>}
        </InfoField>
        <InfoField label={__('Address')}>{asset.address}</InfoField>

        {mutableFields.map(field => (
          <InfoField
            key={field.name}
            label={field.name}
            style={{ alignItems: 'center' }}
          >
            <Field
              name={field.name}
              component={TextField.RF}
              type={assetNumberTypes.includes(field.type) ? 'number' : 'text'}
              min={assetNumberTypes.includes(field.type) ? 0 : undefined}
              placeholder={field.name}
            />
          </InfoField>
        ))}

        <div className="mt3 flex space-between">
          <div />
          <Button
            skin="primary"
            wide
            uppercase
            type="submit"
            disabled={submitting}
          >
            {submitting ? (
              <span>
                <Spinner className="space-right" />
                <span className="v-align">{__('Updating asset')}...</span>
              </span>
            ) : (
              __('Update asset')
            )}
          </Button>
        </div>
      </form>
    );
  }
}

const getMutableFields = schema => schema.filter(field => field.mutable);

const getInitialValues = mutableFields =>
  mutableFields.reduce(
    (values, field) => ({ ...values, [field.name]: field.value }),
    {}
  );

const EditAssetModal = ({ schema, asset }) => {
  const mutableFields = getMutableFields(schema);
  return (
    <Modal>
      {closeModal => (
        <>
          <Modal.Header>{__('Edit asset')}</Modal.Header>
          <Modal.Body>
            <EditAssetForm
              closeModal={closeModal}
              asset={asset}
              mutableFields={mutableFields}
              initialValues={getInitialValues(mutableFields)}
            />
          </Modal.Body>
        </>
      )}
    </Modal>
  );
};

export default EditAssetModal;
