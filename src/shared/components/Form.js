import { useEffect, forwardRef } from 'react';
import { useSelector } from 'react-redux';
import { Form as FinalForm, Field, useFormState } from 'react-final-form';
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

const splitProps = ({
  name,
  afterSubmit,
  allowNull,
  beforeSubmit,
  data,
  defaultValue,
  format,
  formatOnBlur,
  initialValue,
  isEqual,
  multiple,
  parse,
  subscription,
  type,
  validate,
  validateFields,
  value,
  inputProps,
  ...rest
}) => [
  {
    name,
    afterSubmit,
    allowNull,
    beforeSubmit,
    data,
    defaultValue,
    format,
    formatOnBlur,
    initialValue,
    isEqual,
    multiple,
    parse,
    subscription,
    validate,
    validateFields,
    value,
  },
  { ...inputProps, ...rest },
];

Form.TextField = forwardRef(function (props, ref) {
  const [fieldProps, inputProps] = splitProps(props);
  return (
    <Field
      {...fieldProps}
      render={({ input, meta }) => (
        <TextField
          ref={ref}
          error={meta.touched && meta.error}
          {...input}
          {...inputProps}
        />
      )}
    />
  );
});

Form.TextFieldWithKeyboard = forwardRef(function (props, ref) {
  const [fieldProps, inputProps] = splitProps(props);
  return (
    <Field
      {...fieldProps}
      render={({ input, meta }) => (
        <TextFieldWithKeyboard
          ref={ref}
          error={meta.touched && meta.error}
          {...input}
          {...inputProps}
        />
      )}
    />
  );
});

Form.Select = forwardRef(function (props, ref) {
  const [fieldProps, inputProps] = splitProps(props);
  return (
    <Field
      {...fieldProps}
      render={({ input, meta }) => (
        <Select
          ref={ref}
          error={meta.touched && meta.error}
          {...input}
          {...inputProps}
        />
      )}
    />
  );
});

Form.AutoSuggest = forwardRef(function ({ inputProps, ...rest }, ref) {
  const [fieldProps, autoSuggestProps] = splitProps(rest);
  return (
    <Field
      {...fieldProps}
      render={({ input, meta }) => (
        <AutoSuggest
          ref={ref}
          inputProps={{
            error: meta.touched && meta.error,
            ...input,
            ...inputProps,
          }}
          {...autoSuggestProps}
        />
      )}
    />
  );
});

Form.Switch = forwardRef(function (props, ref) {
  const [fieldProps, inputProps] = splitProps(props);
  return (
    <Field
      {...fieldProps}
      render={({ input }) => <Switch ref={ref} {...input} {...inputProps} />}
    />
  );
});

Form.SubmitButton = ({ children, ...rest }) => {
  const { submitting } = useFormState({ subscription: { submitting: true } });
  return (
    <Button type="submit" disabled={submitting} {...rest}>
      {typeof children === 'function' ? children({ submitting }) : children}
    </Button>
  );
};
