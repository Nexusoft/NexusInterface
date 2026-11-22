import RegistryModalHeader from '../RegistryModalHeader';
import arrayMutators from 'final-form-arrays';

import Form from 'components/Form';
import ControlledModal from 'components/ControlledModal';
import Button from 'components/Button';
import FormField from 'components/FormField';
import Spinner from 'components/Spinner';
import styled from '@emotion/styled';
import { fade } from 'utils/color';
import Icon from 'components/Icon';
import QuestionCircle from 'components/QuestionCircle';
import { formSubmit } from 'lib/form';
import { confirmPin, openSuccessDialog } from 'lib/dialog';
import { refreshAssets } from 'lib/user';
import { callAPI } from 'lib/api';
import { createLocalNameFee } from 'lib/fees';
import plusIcon from 'icons/plus.svg';

import AssetFieldCreator from './AssetFieldCreator';
import UT from 'lib/usageTracking';

__ = __context('CreateAsset');

const AssetEditor = styled.div(({ theme }) => ({
  '.asset-section': { marginTop: 24 },
  '.asset-section h3': { margin: 0, fontSize: 15, fontWeight: 500, color: theme.foreground },
  '.asset-section p, .name-note': { margin: '6px 0 12px', fontSize: 12, lineHeight: 1.6, color: theme.mixer(0.6) },
  '.add-field': { marginTop: 14, border: `1px dashed ${fade(theme.primary, 0.6)}`, borderRadius: 10, padding: '10px 16px', color: theme.primary, width: '100%' },
  '.asset-footer': { marginTop: 24, paddingTop: 18, borderTop: `1px solid ${fade(theme.primary, 0.85)}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' },
  '.asset-fee': { display: 'flex', flexDirection: 'column', gap: 3, fontSize: 11, color: theme.mixer(0.65) },
  '.asset-fee strong': { fontSize: 18, fontWeight: 500, color: theme.foreground },
  '.asset-buttons': { display: 'flex', gap: 10, flexWrap: 'wrap', marginLeft: 'auto' },
}));

const createInitialField = () => ({
  name: '',
  value: '',
  mutable: false,
  type: 'string',
  maxlength: '',
});

const initialValues = {
  name: '',
  fields: [createInitialField()],
};

function AssetFields({ fields }) {
  return (
    <>
      {fields.map((fieldName, i) => (
        <AssetFieldCreator
          key={fieldName}
          fieldName={fieldName}
          first={i === 0}
          index={i}
          remove={() => fields.remove(i)}
          onlyField={fields.length === 1}
        />
      ))}
      <Button
        type="button"
        skin="primary"
        className="add-field"
        onClick={() => fields.push(createInitialField())}
      >
        <Icon icon={plusIcon} className="mr0_4" />
        <span className="v-align">{__('Add field')}</span>
      </Button>
    </>
  );
}

export default function CreateAssetModal() {
  return (
    <ControlledModal maxWidth={820}>
      {(closeModal) => (
        <>
          <RegistryModalHeader section="Assets">
            {__('Create a new asset')}
          </RegistryModalHeader>
          <ControlledModal.Body>
            <AssetEditor>
            <Form
              name="create-asset"
              initialValues={initialValues}
              onSubmit={formSubmit({
                submit: async ({ name, fields }) => {
                  const pin = await confirmPin();

                  if (pin) {
                    const params = {
                      pin,
                      format: 'JSON',
                      json: fields.map(
                        ({ name, value, mutable, type, maxlength }) => {
                          const field = { name, value, mutable, type };
                          if (mutable && type === 'string' && maxlength) {
                            field.maxlength = maxlength;
                          }
                          return field;
                        }
                      ),
                    };
                    if (name) params.name = name;
                    return await callAPI('assets/create/asset', params);
                  }
                },
                onSuccess: async (result) => {
                  if (!result) return; // Submission was cancelled
                  UT.CreateNewItem('asset');
                  closeModal();
                  refreshAssets();
                  openSuccessDialog({
                    message: __('New asset has been created'),
                  });
                },
                errorMessage: __('Error creating asset'),
              })}
              mutators={{ ...arrayMutators }}
            >
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
                <Form.TextField
                  name="name"
                  placeholder={__('Asset name (optional)')}
                  autoFocus
                />
              </FormField>

              <p className="name-note">{__('Leave blank to create an unnamed asset.')}</p>
              <section className="asset-section"><h3>{__('Asset data')}</h3><p>{__('Add the fields that describe your asset. Enable Mutable for values you want to edit later.')}</p>

              <Form.FieldArray name="fields" component={AssetFields} />
              </section>

              <div className="asset-footer">
                <div className="asset-fee">
                  <span>{__('Estimated fee')}</span><strong>
                  <Form.Field
                    name="name"
                    render={({ input }) =>
                      !!input.value ? 1 + createLocalNameFee : 1
                    }
                  />{' '}
                  NXS</strong>
                </div>
                <div className="asset-buttons">
                <Button type="button" skin="primary" onClick={closeModal}>{__('Cancel')}</Button>
                <Form.SubmitButton skin="filled-primary">
                  {({ submitting }) =>
                    submitting ? (
                      <span>
                        <Spinner className="mr0_4" />
                        <span className="v-align">
                          {__('Creating asset')}...
                        </span>
                      </span>
                    ) : (
                      __('Create asset')
                    )
                  }
                </Form.SubmitButton>
                </div>
              </div>
            </Form>
            </AssetEditor>
          </ControlledModal.Body>
        </>
      )}
    </ControlledModal>
  );
}
