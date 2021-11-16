import { useEffect, forwardRef } from 'react';
import { useSelector } from 'react-redux';
import {
  Form as FinalForm,
  Field,
  FormSpy,
  useField,
  useForm,
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
import { updateFormInstance, selectFormInstance } from 'lib/form';

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
  const form = useSelector(selectFormInstance(name));
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
  { name, config, validate, type, ...rest },
  ref
) {
  const { input, meta } = useField(name, { validate, type, ...config });
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
  { name, config, validate, type, ...rest },
  ref
) {
  const { input, meta } = useField(name, { validate, type, ...config });
  return (
    <TextFieldWithKeyboard
      ref={ref}
      error={meta.touched && meta.error}
      {...input}
      {...rest}
    />
  );
});

Form.Select = forwardRef(function (
  { name, config, validate, type, ...rest },
  ref
) {
  const { input, meta } = useField(name, { validate, type, ...config });
  return (
    <Select ref={ref} error={meta.touched && meta.error} {...input} {...rest} />
  );
});

Form.AutoSuggest = forwardRef(function (
  { name, config, validate, type, inputProps, ...rest },
  ref
) {
  const { input, meta } = useField(name, { validate, type, ...config });
  const form = useForm();
  return (
    <AutoSuggest
      ref={ref}
      inputProps={{
        error: meta.touched && meta.error,
        ...input,
        ...inputProps,
      }}
      onSelect={(value) => form.change(name, value)}
      {...rest}
    />
  );
});

Form.Switch = forwardRef(function (
  { name, config, validate, type, ...rest },
  ref
) {
  const { input } = useField(name, { validate, type, ...config });
  return <Switch ref={ref} {...input} {...rest} />;
});

Form.SubmitButton = ({ children, ...rest }) => {
  const { submitting } = useFormState({ subscription: { submitting: true } });
  return (
    <Button type="submit" disabled={submitting} {...rest}>
      {typeof children === 'function' ? children({ submitting }) : children}
    </Button>
  );
};
