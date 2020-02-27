import React from 'react';
import { reduxForm, Field, FieldArray } from 'redux-form';
import styled from '@emotion/styled';

import Modal from 'components/Modal';
import Button from 'components/Button';
import FormField from 'components/FormField';
import TextField from 'components/TextField';
import Spinner from 'components/Spinner';
import Divider from 'components/Divider';
import QuestionCircle from 'components/QuestionCircle';
import confirmPin from 'utils/promisified/confirmPin';
import { errorHandler } from 'utils/form';
import { openSuccessDialog } from 'lib/ui';
import { loadNameRecords } from 'lib/user';
import { apiPost } from 'lib/tritiumApi';

import AssetFieldCreator from './AssetFieldCreator';

__ = __context('CreateAsset');

@reduxForm({
  form: 'create-asset',
  destroyOnUnmount: false,
  initialValues: {
    name: '',
    format: 'basic',
    data: '',
    data: [
      {
        name: '',
        value: '',
        mutable: false,
        type: 'string',
        maxlength: null,
      },
      {
        name: '',
        value: '',
        mutable: false,
        type: 'string',
        maxlength: null,
      },
    ],
  },
  validate: ({ name, namespace, type }) => {
    const errors = {};

    return errors;
  },
  onSubmit: async ({ type, name, namespace, registerAddress }) => {
    const pin = await confirmPin();

    if (pin) {
      return await apiPost('names/create/name', {
        pin,
        name,
        global: type === 'global',
        namespace: type === 'namespaced' ? namespace : undefined,
        register_address: registerAddress,
      });
    }
  },
  onSubmitSuccess: async (result, dispatch, props) => {
    if (!result) return; // Submission was cancelled
    loadNameRecords();
    props.reset();
    props.closeModal();
    openSuccessDialog({
      message: __('New name has been created'),
    });
  },
  onSubmitFail: errorHandler(__('Error creating name')),
})
class CreateAssetForm extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { handleSubmit, submitting, form } = this.props;
    console.log('form', form);
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
          />
        </FormField>
        <Field
          name="name"
          component={({ input }) =>
            !!input.value && (
              <div className="dim" style={{ marginTop: '.3em' }}>
                {__('Name creation fee')}: 1 NXS
              </div>
            )
          }
        />

        <Divider title={__('Asset data')} style={{ marginBottom: 0 }} />

        <FieldArray
          name="data"
          component={({ fields }) =>
            fields.map((fieldName, i) => (
              <AssetFieldCreator
                key={fieldName}
                fieldName={fieldName}
                first={i === 0}
                form={form}
              />
            ))
          }
        />

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
              <span className="v-align">{__('Creating asset')}...</span>
            </span>
          ) : (
            __('Create asset')
          )}
        </Button>
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
