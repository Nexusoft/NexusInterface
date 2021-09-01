import { reduxForm, Field } from 'redux-form';
import styled from '@emotion/styled';

import ControlledModal from 'components/ControlledModal';
import TextFieldWithKeyboard from 'components/TextFieldWithKeyboard';
import Button from 'components/Button';
import { removeModal } from 'lib/ui';

__ = __context('PinDialog');

const PinInput = styled(TextFieldWithKeyboard.RF)({
  margin: '1em auto 2.5em',
  fontSize: 18,
});

const Note = styled.div({
  marginTop: '-1.5em',
  marginBottom: '1.5em',
});

const formOptions = {
  form: 'pin',
  destroyOnUnmount: true,
  initialValues: {
    pin: '',
  },
  validate: ({ pin }) => {
    const errors = {};
    if (!pin || pin.length < 4) {
      errors.pin = __('Pin must be at least 4 characters');
    }
    return errors;
  },
  onSubmit: ({ pin }, dispatch, props) => {
    if (props.submitPin) {
      props.submitPin(pin);
    }
    removeModal(props.modalId);
  },
};

const PinDialog = ({
  handleSubmit,
  note = null,
  confirmLabel = __('Confirm'),
  onClose,
}) => (
  <ControlledModal maxWidth={350} onClose={onClose}>
    {(closeModal) => (
      <>
        <ControlledModal.Header>{__('Enter PIN')}</ControlledModal.Header>
        <ControlledModal.Body>
          <form onSubmit={handleSubmit}>
            <Field
              component={PinInput}
              maskable
              name="pin"
              autoFocus
              skin="filled-inverted"
              placeholder={__('Your PIN')}
            />
            {!!note && <Note>{note}</Note>}
            <div className="flex space-between">
              <Button onClick={closeModal}>{__('Cancel')}</Button>
              <Button type="submit" skin="primary">
                {confirmLabel}
              </Button>
            </div>
          </form>
        </ControlledModal.Body>
      </>
    )}
  </ControlledModal>
);

export default reduxForm(formOptions)(PinDialog);
