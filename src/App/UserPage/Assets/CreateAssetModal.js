import arrayMutators from 'final-form-arrays';

import Form from 'components/Form';
import ControlledModal from 'components/ControlledModal';
import Button from 'components/Button';
import FormField from 'components/FormField';
import Spinner from 'components/Spinner';
import Divider from 'components/Divider';
import Icon from 'components/Icon';
import QuestionCircle from 'components/QuestionCircle';
import { formSubmit } from 'lib/form';
import { confirmPin, openSuccessDialog } from 'lib/dialog';
import { assetsQuery } from 'lib/user';
import { callAPI } from 'lib/api';
import { createLocalNameFee } from 'lib/fees';
import plusIcon from 'icons/plus.svg';

import AssetFieldCreator from './AssetFieldCreator';
import UT from 'lib/usageTracking';

__ = __context('CreateAsset');

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
          remove={() => fields.remove(i)}
          onlyField={fields.length === 1}
        />
      ))}
      <Button
        uppercase
        skin="hyperlink"
        className="mt2"
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
    <ControlledModal style={{ width: '80%' }} maxWidth={900}>
      {(closeModal) => (
        <>
          <ControlledModal.Header>
            {__('Create a new asset')}
          </ControlledModal.Header>
          <ControlledModal.Body>
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
                  assetsQuery.refetch();
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

              <Divider label={__('Asset data')} style={{ marginBottom: 0 }} />

              <Form.FieldArray name="fields" component={AssetFields} />

              <div className="mt3">
                <div className="text-center dim">
                  <span>{__('Estimated fee')}: </span>
                  <Form.Field
                    name="name"
                    render={({ input }) =>
                      !!input.value ? 1 + createLocalNameFee : 1
                    }
                  />{' '}
                  NXS
                </div>
                <Form.SubmitButton
                  skin="primary"
                  wide
                  uppercase
                  className="mt1"
                >
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
            </Form>
          </ControlledModal.Body>
        </>
      )}
    </ControlledModal>
  );
}
