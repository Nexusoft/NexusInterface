import { ReactNode } from 'react';
import { FORM_ERROR, FormApi, FieldState } from 'final-form';
import { useField } from 'react-final-form';

import { openErrorDialog } from 'lib/dialog';

const forms: Record<string, FormApi> = {};

export function updateFormInstance(formName: string, instance: FormApi) {
  forms[formName] = instance;
}

export const getFormInstance = (formName: string) => forms[formName];

const defaultOnFail = (err: any, errorMessage: ReactNode) => {
  openErrorDialog({
    message: errorMessage || __('Error'),
    note: err?.message || (typeof err === 'string' ? err : __('Unknown error')),
  });
  return {
    [FORM_ERROR]: err,
  };
};

interface FormSubmitOptions<
  FormValues,
  InitialFormValues,
  SubmitResult = void
> {
  submit: (
    values: FormValues,
    form: FormApi<FormValues, InitialFormValues>
  ) => SubmitResult | Promise<SubmitResult>;
  onSuccess: (
    result: SubmitResult,
    values: FormValues,
    form: FormApi<FormValues, InitialFormValues>
  ) => void;
  onFail: (err: any, errorMessage: ReactNode) => void;
  errorMessage: ReactNode;
}

export function formSubmit<FormValues, InitialFormValues>({
  submit,
  onSuccess,
  onFail = defaultOnFail,
  errorMessage,
}: FormSubmitOptions<FormValues, InitialFormValues>) {
  return async (
    values: FormValues,
    form: FormApi<FormValues, InitialFormValues>
  ) => {
    let result;
    try {
      result = await Promise.resolve(submit(values, form));
    } catch (err) {
      return onFail(err, errorMessage);
    }
    onSuccess?.(result, values, form);
  };
}

export function useFieldValue(name: string) {
  const {
    input: { value },
  } = useField(name, { subscription: { value: true } });
  return value;
}

export const numericOnly = (value: unknown) =>
  (value ? String(value) : '').replace(/\D/g, '');

/**
 * VALIDATE FUNCTIONS
 */

type Validator = (
  value: any,
  allValues: Record<string, any>,
  meta: FieldState<any>
) => any;

export const checkAll =
  (...validations: Validator[]): Validator =>
  (value, allValues, meta) => {
    for (const validation of validations) {
      const result = validation(value, allValues, meta);
      if (result) return result;
    }
  };

export const required =
  (message = __('Required!')) =>
  (value: any) =>
    !value && value !== 0 ? message : undefined;

export const regex =
  (regexp: RegExp, message = __('Invalid!')) =>
  (value: any) =>
    typeof value !== 'string' || !regexp.test(value) ? message : undefined;

export const range =
  (min: number, max: number, message = __('Out of range!')) =>
  (value: any) =>
    ((min || min === 0) && value < min) || ((max || max === 0) && value > max)
      ? message
      : undefined;

export const oneOf = (list: any[], message: string) => (value: any) =>
  !list.includes(value) ? message : undefined;

export const notOneOf = (list: any[], message: string) => (value: any) =>
  list.includes(value) ? message : undefined;

export const minChars = (min: number) => (value: any) =>
  value.length < min
    ? __('Must be at least %{min} characters', { min })
    : undefined;

export function resolveValue(input: any) {
  if (input?.target) {
    const el = input.target;
    if (el.type === 'checkbox') {
      return el.checked;
    } else if (el.type === 'number') {
      return parseInt(el.value);
    } else {
      return el.value;
    }
  }
  return input;
}

export function handleError(error: any, message = __('Error')) {
  openErrorDialog({
    message,
    note: (error && error.message) || __('Unknown error'),
  });
}
