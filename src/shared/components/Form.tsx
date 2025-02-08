import {
  useEffect,
  forwardRef,
  useState,
  ComponentType,
  ReactNode,
  ComponentProps,
} from 'react';
import {
  Form as FinalForm,
  Field,
  FormSpy,
  useField,
  useFormState,
  FormRenderProps,
} from 'react-final-form';
// TODO: Replace react-final-form-arrays and react-final-form altogether since they seem to be abandonned
import { FieldArray } from 'react-final-form-arrays';
import { Config, createForm, FieldValidator } from 'final-form';

import TextField, {
  SinglelineTextFieldProps,
  MultilineTextFieldProps,
} from 'components/TextField';
import TextFieldWithKeyboard, {
  SinglelineTextFieldWithKeyboardProps,
  MultilineTextFieldWithKeyboardProps,
} from 'components/TextFieldWithKeyboard';
import Select from 'components/Select';
import AutoSuggest from 'components/AutoSuggest';
import Switch from 'components/Switch';
import Button from 'components/Button';
import Slider from 'components/Slider';
import { updateFormInstance, getFormInstance } from 'lib/form';

export interface FormProps<FormValues> extends Config<FormValues> {
  name: string;
  persistState?: boolean;
  children?: ReactNode;
  render?: (props: FormRenderProps<FormValues>) => ReactNode;
  component?: ComponentType<FormRenderProps<FormValues>>;
  subscription?: ComponentProps<typeof FinalForm>['subscription'];
}

export default function Form<FormValues extends Record<string, any>>({
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
  subscription,
}: FormProps<FormValues>) {
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
  const [form, setForm] = useState(getFormInstance(name));
  useEffect(() => {
    if (persistState && !form) {
      const form = createForm(config);
      updateFormInstance(name, form);
      setForm(form);
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
    <FinalForm subscription={subscription} form={form} {...config}>
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

export interface FormComponentProps {
  name: string;
  config?: Config<any>;
  validate?: FieldValidator<any>;
}

interface SinglelineFormTextFieldProps
  extends FormComponentProps,
    Omit<SinglelineTextFieldProps, 'name'> {}
interface MultilineFormTextFieldProps
  extends FormComponentProps,
    Omit<MultilineTextFieldProps, 'name'> {}
function FormTextField(props: SinglelineFormTextFieldProps): ReactNode;
function FormTextField(props: MultilineFormTextFieldProps): ReactNode;
function FormTextField({
  name,
  config,
  validate,
  ...rest
}: SinglelineFormTextFieldProps | MultilineFormTextFieldProps) {
  const { input, meta } = useField(name, { validate, ...config });
  // Need this discrimination type guard to narrow the rest type down to
  // either SinglelineTextFieldProps or MultilineTextFieldProps
  if (rest.multiline) {
    return (
      <TextField error={meta.touched && meta.error} {...input} {...rest} />
    );
  } else {
    return (
      <TextField error={meta.touched && meta.error} {...input} {...rest} />
    );
  }
}
Form.TextField = FormTextField;

interface SinglelineFormTextFieldWithKeyboardProps
  extends FormComponentProps,
    Omit<SinglelineTextFieldWithKeyboardProps, 'name'> {}
interface MultilineFormTextFieldWithKeyboardProps
  extends FormComponentProps,
    Omit<MultilineTextFieldWithKeyboardProps, 'name'> {}
function FormTextFieldWithKeyboard(
  props: SinglelineFormTextFieldWithKeyboardProps
): ReactNode;
function FormTextFieldWithKeyboard(
  props: MultilineFormTextFieldWithKeyboardProps
): ReactNode;
function FormTextFieldWithKeyboard({
  name,
  config,
  validate,
  ...rest
}:
  | SinglelineFormTextFieldWithKeyboardProps
  | MultilineFormTextFieldWithKeyboardProps) {
  const { input, meta } = useField(name, { validate, ...config });
  // Need this discrimination type guard to narrow the rest type down to
  // either SinglelineTextFieldProps or MultilineTextFieldProps
  if (rest.multiline) {
    return (
      <TextFieldWithKeyboard
        error={meta.touched && meta.error}
        {...input}
        {...rest}
      />
    );
  } else {
    return (
      <TextFieldWithKeyboard
        error={meta.touched && meta.error}
        {...input}
        {...rest}
      />
    );
  }
}
Form.TextFieldWithKeyboard = FormTextFieldWithKeyboard;

Form.Select = function ({
  name,
  config,
  validate,
  ...rest
}: ComponentProps<typeof Select> & {
  name: string;
  config?: Config<any>;
  validate?: FieldValidator<any>;
}) {
  const { input, meta } = useField(name, { validate, ...config });
  return <Select error={meta.touched && meta.error} {...input} {...rest} />;
};

Form.AutoSuggest = function ({
  name,
  config,
  validate,
  inputProps,
  onSelect,
  ...rest
}: ComponentProps<typeof AutoSuggest> & {
  name: string;
  config?: Config<any>;
  validate?: FieldValidator<any>;
}) {
  const { input, meta } = useField(name, { validate, ...config });
  return (
    <AutoSuggest
      inputProps={{
        error: meta.touched && meta.error,
        ...input,
        ...inputProps,
      }}
      onSelect={(value) => input.onChange(value)}
      {...rest}
    />
  );
};

Form.Switch = forwardRef<
  HTMLInputElement,
  ComponentProps<typeof Switch> & {
    name: string;
    config?: Config<any>;
    validate?: FieldValidator<any>;
  }
>(function ({ name, config, validate, ...rest }, ref) {
  const { input } = useField(name, { validate, type: 'checkbox', ...config });
  return <Switch ref={ref} {...input} {...rest} />;
});

Form.Slider = forwardRef<
  HTMLInputElement,
  ComponentProps<typeof Slider> & {
    name: string;
    config?: Config<any>;
    validate?: FieldValidator<any>;
  }
>(function ({ name, config, validate, ...rest }, ref) {
  const { input, meta } = useField(name, {
    validate,
    ...config,
  });
  return (
    <Slider ref={ref} error={meta.touched && meta.error} {...input} {...rest} />
  );
});

Form.SubmitButton = ({
  children,
  ...rest
}: Omit<ComponentProps<typeof Button>, 'children'> & {
  children: ReactNode | ((props: { submitting: boolean }) => ReactNode);
}) => {
  const { submitting } = useFormState({ subscription: { submitting: true } });
  return (
    <Button type="submit" disabled={submitting} waiting={submitting} {...rest}>
      {typeof children === 'function' ? children({ submitting }) : children}
    </Button>
  );
};
