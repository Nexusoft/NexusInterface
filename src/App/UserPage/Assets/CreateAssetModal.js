import React from 'react';
import { reduxForm, Field, FieldArray } from 'redux-form';

import Modal from 'components/Modal';
import Button from 'components/Button';
import FormField from 'components/FormField';
import TextField from 'components/TextField';
import Spinner from 'components/Spinner';
import Divider from 'components/Divider';
import Icon from 'components/Icon';
import QuestionCircle from 'components/QuestionCircle';
import confirmPin from 'utils/promisified/confirmPin';
import { errorHandler } from 'utils/form';
import { openSuccessDialog } from 'lib/ui';
import { loadAssets } from 'lib/user';
import { apiPost } from 'lib/tritiumApi';
import { createLocalNameFee } from 'lib/fees';
import plusIcon from 'icons/plus.svg';

import AssetFieldCreator from './AssetFieldCreator';

__ = __context('CreateAsset');

const createInitialField = () => ({
  name: '',
  value: '',
  mutable: false,
  type: 'string',
  maxlength: '',
});

const AssetFields = ({ fields, form, removeField }) =>
  fields.map((fieldName, i) => (
    <AssetFieldCreator
      key={fieldName}
      fieldName={fieldName}
      first={i === 0}
      form={form}
      remove={() => removeField(i)}
      onlyField={fields.length === 1}
    />
  ));

@reduxForm({
  form: 'create-asset',
  destroyOnUnmount: false,
  initialValues: {
    name: '',
    fields: [createInitialField()],
  },
  validate: ({ fields }) => {
    const errors = {};
    const fieldsErrors = [];

    if (fields) {
      fields.forEach(({ name }, i) => {
        const fieldErrors = {};
        if (!name) {
          fieldErrors.name = __('Field name is required');
        }
        if (Object.keys(fieldErrors).length) {
          fieldsErrors[i] = fieldErrors;
        }
      });
    }

    if (fieldsErrors.length) {
      errors.fields = fieldsErrors;
    }

    return errors;
  },
  onSubmit: async ({ name, fields }) => {
    const pin = await confirmPin();

    if (pin) {
      const params = {
        pin,
        format: 'JSON',
        json: fields.map(({ name, value, mutable, type, maxlength }) => {
          const field = { name, value, mutable, type };
          if (mutable && type === 'string' && maxlength) {
            field.maxlength = maxlength;
          }
          return field;
        }),
      };
      if (name) params.name = name;
      return await apiPost('assets/create/asset', params);
    }
  },
  onSubmitSuccess: async (result, dispatch, props) => {
    if (!result) return; // Submission was cancelled
    loadAssets();
    props.reset();
    props.closeModal();
    openSuccessDialog({
      message: __('New asset has been created'),
    });
  },
  onSubmitFail: errorHandler(__('Error creating asset')),
})
class CreateAssetForm extends React.Component {
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
    const { handleSubmit, submitting, form } = this.props;
    return (
      <form onSubmit={handleSubmit}>
        <FormField
          connectLabel
          label={
            <span>
              <span className="v-align">{__('Asset name')}</span>
              <QuestionCircle
                tooltip={__(
                  'A local Name object register will be created for this asset name'
                )}
              />
            </span>
          }
        >
          <Field
            name="name"
            component={TextField.RF}
            placeholder={__('Asset name (optional)')}
            autoFocus
          />
        </FormField>

        <Divider label={__('Asset data')} style={{ marginBottom: 0 }} />

        <FieldArray
          name="fields"
          component={AssetFields}
          form={form}
          removeField={this.removeField}
        />

        <Button
          uppercase
          skin="hyperlink"
          className="mt2"
          onClick={this.addField}
        >
          <Icon icon={plusIcon} className="space-right" />
          <span className="v-align">{__('Add field')}</span>
        </Button>

        <div className="mt3">
          <div className="text-center dim">
            <span>{__('Estimated fee')}: </span>
            <Field
              name="name"
              component={({ input }) =>
                !!input.value ? 1 + createLocalNameFee : 1
              }
            />{' '}
            NXS
          </div>
          <Button
            skin="primary"
            wide
            uppercase
            className="mt1"
            type="submit"
            disabled={submitting}
          >
            {submitting ? (
              <span>
                <Spinner className="space-right" />
                <span className="v-align">{__('Creating asset')}...</span>
              </span>
            ) : (
              __('Create asset')
            )}
          </Button>
        </div>
      </form>
    );
  }
}

const CreateAssetModal = () => (
  <Modal style={{ maxWidth: 600 }}>
    {closeModal => (
      <>
        <Modal.Header>{__('Create a new asset')}</Modal.Header>
        <Modal.Body>
          <CreateAssetForm closeModal={closeModal} />
        </Modal.Body>
      </>
    )}
  </Modal>
);

export default CreateAssetModal;
