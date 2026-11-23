import {
  useContext,
  useEffect,
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

import {
  TextField,
  TextFieldProps,
  MultilineTextFieldProps,
  MultilineTextField,
} from 'components/TextField';
import {
  TextFieldWithKeyboard,
  TextFieldWithKeyboardProps,
  MultilineTextFieldWithKeyboardProps,
  MultilineTextFieldWithKeyboard,
} from 'components/TextFieldWithKeyboard';
import Select from 'components/Select';
import AutoSuggest from 'components/AutoSuggest';
import Switch from 'components/Switch';
import Button from 'components/Button';
import Slider from 'components/Slider';
import { updateFormInstance, getFormInstance } from 'lib/form';
import ModalLockContext from 'context/modalLock';

//while a form submits nothing in it can be changed, and its modal stays open
//display:contents means the fieldset adds no box of its own, so wrapping every form in it cannot change any
//form's layout; a disabled fieldset still disables its descendant controls regardless of display
const plainFieldSet = { display: 'contents' } as const;

function SubmitLock({
  submitting,
  children,
}: {
  submitting: boolean;
  children: ReactNode;
}) {
  const lockModal = useContext(ModalLockContext);
  useEffect(() => {
    lockModal?.(submitting);
    return () => lockModal?.(false);
  }, [submitting]);
  return (
    <fieldset disabled={submitting} style={plainFieldSet}>
      {children}
    </fieldset>
  );
}

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
          <FormSpy subscription={{ submitting: true }}>
            {({ submitting }) => (
              <SubmitLock submitting={!!submitting}>
                {typeof formContent === 'function'
                  ? formContent({
                      handleSubmit,
                      // passing children to render function if both exist to
                      // replicate original FinalForm's behavior
                      children: render ? children : undefined,
                      ...rest,
                    })
                  : formContent}
              </SubmitLock>
            )}
          </FormSpy>
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

Form.TextField = ({
  name,
  config,
  validate,
  ...rest
}: FormComponentProps & Omit<TextFieldProps, 'name'>) => {
  const { input, meta } = useField(name, { validate, ...config });
  return <TextField error={meta.touched && meta.error} {...rest} {...input} />;
};

Form.MultilineTextField = ({
  name,
  config,
  validate,
  ...rest
}: FormComponentProps & Omit<MultilineTextFieldProps, 'name'>) => {
  const { input, meta } = useField(name, { validate, ...config });
  return (
    <MultilineTextField
      error={meta.touched && meta.error}
      {...input}
      {...rest}
    />
  );
};

Form.TextFieldWithKeyboard = ({
  name,
  config,
  validate,
  ...rest
}: FormComponentProps & Omit<TextFieldWithKeyboardProps, 'name'>) => {
  const { input, meta } = useField(name, { validate, ...config });
  return (
    <TextFieldWithKeyboard
      error={meta.touched && meta.error}
      {...input}
      {...rest}
    />
  );
};

Form.MultilineTextFieldWithKeyboard = ({
  name,
  config,
  validate,
  ...rest
}: FormComponentProps & Omit<MultilineTextFieldWithKeyboardProps, 'name'>) => {
  const { input, meta } = useField(name, { validate, ...config });
  return (
    <MultilineTextFieldWithKeyboard
      error={meta.touched && meta.error}
      {...input}
      {...rest}
    />
  );
};

Form.Select = function ({
  name,
  config,
  validate,
  ...rest
}: Omit<ComponentProps<typeof Select>, 'value' | 'onChange'> &
  FormComponentProps) {
  const { input, meta } = useField(name, { validate, ...config });
  return <Select error={meta.touched && meta.error} {...rest} {...input} />;
};

Form.AutoSuggest = function ({
  name,
  config,
  validate,
  inputProps,
  ...rest
}: Omit<ComponentProps<typeof AutoSuggest>, 'onSelect'> & FormComponentProps) {
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

Form.Switch = function ({
  name,
  config,
  validate,
  ...rest
}: ComponentProps<typeof Switch> & FormComponentProps) {
  const { input } = useField(name, { validate, type: 'checkbox', ...config });
  return <Switch {...rest} {...input} />;
};

Form.Slider = function ({
  name,
  config,
  validate,
  ...rest
}: ComponentProps<typeof Slider> & FormComponentProps) {
  const { input, meta } = useField(name, {
    validate,
    ...config,
  });
  return <Slider error={meta.touched && meta.error} {...rest} {...input} />;
};

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
