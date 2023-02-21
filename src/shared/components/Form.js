import { useEffect, forwardRef } from 'react';
import {
  Form as FinalForm,
  Field,
  FormSpy,
  useField,
  useFormState,
} from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';
import { createForm } from 'final-form';

import TextField from 'components/TextField';
import TextFieldWithKeyboard from 'components/TextFieldWithKeyboard';
import Select from 'components/Select';
import AutoSuggest from 'components/AutoSuggest';
import Switch from 'components/Switch';
import Button from 'components/Button';
import Slider from 'components/Slider';
import { updateFormInstance, getFormInstance } from 'lib/form';

export default function Form({
  name,
  persistState,
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
  const form = getFormInstance(name);
  useEffect(() => {
    if (persistState && !form) {
      const form = createForm(config);
      updateFormInstance(name, form);
    }
  }, []);

  // Skip rendering on the first render to wait for form instance to be created
  if (persistState && !form) return null;

  const formContent =
    render ||
    children ||
    (Component ? (props) => <Component {...props} /> : null);

  if (!formContent) return null;

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

Form.Field = Field;

Form.FieldArray = FieldArray;

Form.Spy = FormSpy;

Form.TextField = forwardRef(function (
  { name, config, validate, ...rest },
  ref
) {
  const { input, meta } = useField(name, { validate, ...config });
  return (
    <TextField
      ref={ref}
      error={meta.touched && meta.error}
      {...input}
      {...rest}
    />
  );
});

Form.TextFieldWithKeyboard = forwardRef(function (
  { name, config, validate, ...rest },
  ref
) {
  const { input, meta } = useField(name, { validate, ...config });
  return (
    <TextFieldWithKeyboard
      ref={ref}
      error={meta.touched && meta.error}
      {...input}
      {...rest}
    />
  );
});

Form.Select = forwardRef(function ({ name, config, validate, ...rest }, ref) {
  const { input, meta } = useField(name, { validate, ...config });
  return (
    <Select ref={ref} error={meta.touched && meta.error} {...input} {...rest} />
  );
});

Form.AutoSuggest = forwardRef(function (
  { name, config, validate, inputProps, ...rest },
  ref
) {
  const { input, meta } = useField(name, { validate, ...config });
  return (
    <AutoSuggest
      ref={ref}
      inputProps={{
        error: meta.touched && meta.error,
        ...input,
        ...inputProps,
      }}
      onSelect={(value) => input.onChange(value)}
      {...rest}
    />
  );
});

Form.Switch = forwardRef(function ({ name, config, validate, ...rest }, ref) {
  const { input } = useField(name, { validate, type: 'checkbox', ...config });
  return <Switch ref={ref} {...input} {...rest} />;
});

Form.Slider = forwardRef(function ({ name, config, validate, ...rest }, ref) {
  const { input, meta } = useField(name, {
    validate,
    ...config,
  });
  return (
    <Slider ref={ref} error={meta.touched && meta.error} {...input} {...rest} />
  );
});

Form.SubmitButton = ({ children, ...rest }) => {
  const { submitting } = useFormState({ subscription: { submitting: true } });
  return (
    <Button type="submit" disabled={submitting} waiting={submitting} {...rest}>
      {typeof children === 'function' ? children({ submitting }) : children}
    </Button>
  );
};
