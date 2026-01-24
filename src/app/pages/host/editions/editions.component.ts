import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableLazyLoadEvent } from 'primeng/table';
import { SharedModule } from '@app/shared/shared.imports';
import { ColumnDef, FormField, TableAction } from '@app/shared/models';
import { EditionService } from '@app/pages/services/api';
import { Edition } from '@app/pages/models';

@Component({
  selector: 'app-editions',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './editions.component.html',
  styleUrl: './editions.component.scss'
})
export class EditionsComponent implements OnInit {
    private editionService = inject(EditionService);
    private fb = inject(FormBuilder);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);

    editions: Edition[] = [];
    totalCount = 0;
    loading = true;
    dialogVisible = false;
    editMode = false;
    form!: FormGroup;

    columns: ColumnDef[] = [
        { field: 'displayName', header: 'Name' },
        { field: 'name', header: 'Code' },
        { field: 'monthlyPrice', header: 'Price' },
        { field: 'maxUsers', header: 'Max Users' },
        { field: 'trialDays', header: 'Trial Days' },
        { field: 'isActive', header: 'Status' }
    ];

    actions: TableAction[] = [
        {
            label: 'Edit',
            icon: 'pi pi-pencil',
            command: (data: Edition) => this.editEdition(data)
        },
        {
            label: 'Delete',
            icon: 'pi pi-trash',
            severity: 'danger',
            outlined: true,
            command: (data: Edition) => this.deleteEdition(data)
        }
    ];

    formFields: FormField[] = [
        {
            key: 'name',
            label: 'Edition Code',
            type: 'text',
            mark: true,
            validators: [Validators.required],
            errorMessages: { required: 'Code is required.' }
        },
        {
            key: 'displayName',
            label: 'Display Name',
            type: 'text',
            mark: true,
            validators: [Validators.required],
            errorMessages: { required: 'Display name is required.' }
        },
        {
            key: 'monthlyPrice',
            label: 'Monthly Price',
            type: 'number',
            mark: true,
            validators: [Validators.required],
            errorMessages: { required: 'Price is required.' }
        },
        {
            key: 'maxUsers',
            label: 'Max Users (0 = Unlimited)',
            type: 'number',
            mark: true,
            validators: [Validators.required],
            errorMessages: { required: 'Max users is required.' }
        }
    ];

    ngOnInit(): void {
        this.initializeForm();
    }

    initializeForm() {
        this.form = this.fb.group({
            id: [0],
            name: ['', Validators.required],
            displayName: ['', Validators.required],
            monthlyPrice: [0, Validators.required],
            maxUsers: [0, Validators.required],
            trialDays: [0],
            isActive: [true]
        });
    }

    loadEditions(event: TableLazyLoadEvent): void {
        this.loading = true;
        this.editionService.getAll().subscribe({
            next: (res: any) => {
                this.editions = res.result.items;
                this.totalCount = res.result.totalCount;
            },
            complete: () => this.loading = false
        });
    }

    openCreateDialog(): void {
        this.editMode = false;
        this.form.reset({ id: 0, isActive: true, monthlyPrice: 0, maxUsers: 0, trialDays: 0 });
        this.dialogVisible = true;
    }

    editEdition(edition: Edition): void {
        this.editMode = true;
        this.form.patchValue(edition);
        this.dialogVisible = true;
    }

    saveEdition(): void {
        if (this.form.invalid) return;
        
        const edition = this.form.value;
        console.log('Saving edition:', edition);
        
        this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Edition ${this.editMode ? 'updated' : 'created'} successfully`
        });
        
        this.dialogVisible = false;
        this.loadEditions({ first: 0, rows: 10 });
    }

    deleteEdition(edition: Edition): void {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete "${edition.displayName}"?`,
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                console.log('Deleting edition:', edition.id);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Deleted',
                    detail: 'Edition deleted successfully'
                });
                this.loadEditions({ first: 0, rows: 10 });
            }
        });
    }

    isFieldInvalid(fieldKey: string): boolean {
        const field = this.form.get(fieldKey);
        return !!(field?.invalid && (field?.dirty || field?.touched));
    }

    getFieldErrors(fieldKey: string): string[] {
        const field = this.form.get(fieldKey);
        const errors: string[] = [];
        if (field?.errors && this.isFieldInvalid(fieldKey)) {
            const fieldConfig = this.formFields.find((f) => f.key === fieldKey);
            if (fieldConfig) {
                Object.keys(field.errors).forEach((errorKey) => {
                    if (fieldConfig.errorMessages[errorKey]) {
                        errors.push(fieldConfig.errorMessages[errorKey]);
                    }
                });
            }
        }
        return errors;
    }
}
