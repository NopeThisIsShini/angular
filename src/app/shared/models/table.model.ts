import { TemplateRef } from '@angular/core';
import { ButtonSeverity } from 'primeng/button';

export interface ColumnDef {
    field: string; // key in the row object
    header: string; // column header
    sortable?: boolean; // is column sortable
    filterable?: boolean; // is column filterable
    filterType?: 'text' | 'select' | 'date'; // type of filter
    filterOptions?: { label: string; value: any }[]; // options for select filter
    template?: TemplateRef<any>; // optional custom template for this column
}

export interface TableAction {
    label?: string;
    icon?: string;
    tooltip?: string;
    severity?: ButtonSeverity;
    outlined?: boolean;
    visible?: (row: any) => boolean;
    command: (row: any) => void;
}
