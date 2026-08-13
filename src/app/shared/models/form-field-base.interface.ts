export type FormFieldType =
  // Actions
  | 'button'
  | 'file'
  | 'submit'
  // Date/Time
  | 'month'
  | 'week'
  | 'date'
  | 'datetime'
  | 'time'
  // Selections
  | 'checkbox'
  | 'color'
  // Form
  | 'text'
  | 'email'
  | 'number'
  | 'password'
  | 'image'
  | 'radio'
  | 'tel'
  | 'select'
  | 'url';

export type FormFieldSize = 'full' | 'half';

export interface FormFieldBase {
  id?: string;
  label: string;
  formControlName: string;
  type: FormFieldType;
  required?: boolean;
  placeholder?: string;
  errorMessages?: { [key: string]: string };
  validators?: any[];
  asyncValidators?: any[];
  size?: FormFieldSize;
  maxLength?: number;
}
