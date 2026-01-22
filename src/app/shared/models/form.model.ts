export interface FormField {
    key: string;
    label: string;
    type: 'text' | 'password' | 'number' | 'date' | 'select' | 'checkbox';
    mark?: boolean;
    validators: any[];
    errorMessages: { [key: string]: string };
}
export interface SelectField {
    key: string;
    label: string;
    options: any[];
    optionLabel: string;
    optionValue: string;
    validators?: any[];
    errorMessage?: string;
    isMulti?: boolean;
}

export interface CheckboxField {
    key: string;
    label: string;
}
