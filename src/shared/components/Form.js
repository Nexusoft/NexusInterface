import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Form as FinalForm, useFormState } from 'react-final-form';
import { createForm } from 'final-form';

import TextField from 'components/TextField';
import Select from 'components/Select';
import Switch from 'components/Switch';
import Button from 'components/Button';
import { updateFormInstance, selectFormInstance } from 'lib/forms';

export default function Form({
  name,
  persistState = true,
  children,
  render,
  component: Component,
  debug,
  destroyOnUnregister,
  initialValues,
  keepDirtyOnReinitialize,
  mutators,
  onSubmit,
  validate,
  validateOnBlur,
  ...rest
}) {
  const config = {
    debug,
    destroyOnUnregister,
    initialValues,
    keepDirtyOnReinitialize,
    mutators,
    onSubmit,
    validate,
    validateOnBlur,
  };
  useEffect(() => {
    if (persistState) {
      const form = createForm(config);
      updateFormInstance(name, form);
    }
  }, []);
  const form = useSelector(selectFormInstance(name));

  // Skip rendering on the first render to wait for form instance to be created
  if (persistState && !!form) return null;

  const formContent =
    render || children || ((props) => <Component {...props} />);

  return (
    <FinalForm subscription={{}} form={form} {...config} {...rest}>
      {({ handleSubmit, ...rest }) => (
        <form onSubmit={handleSubmit}>
          {typeof formContent === 'function'
            ? formContent({
                handleSubmit,
                // passing children to render function if both exist to
                // replicate original FinalForm's behavior
                children: render ? children : undefined,
                ...rest,
              })
            : formContent}
        </form>
      )}
    </FinalForm>
  );
}

Form.TextField = ({ input, meta, ...rest }) => (
  <TextField error={meta.touched && meta.error} {...input} {...rest} />
);

Form.Select = ({ input, meta, ...rest }) => (
  <Select error={meta.touched && meta.error} {...input} {...rest} />
);

Form.Switch = ({ input, meta, ...rest }) => <Switch {...input} {...rest} />;

Form.SubmitButton = (props) => {
  const { submitting } = useFormState({ subscription: { submitting: true } });
  return <Button type="submit" disabled={submitting} {...props} />;
};
