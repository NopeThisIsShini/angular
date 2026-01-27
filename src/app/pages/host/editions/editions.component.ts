import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableLazyLoadEvent } from 'primeng/table';
import { SharedModule } from '@app/shared/shared.imports';
import { ColumnDef, TableAction } from '@app/shared/models';
import { EditionModel } from '@app/pages/models';
import { EditionService } from '@app/pages/services/api';
import { validationConstants } from '@app/utils/constant';

@Component({
    selector: 'app-editions',
    imports: [SharedModule],
    templateUrl: './editions.component.html',
    styleUrl: './editions.component.scss'
})
export class EditionsComponent implements OnInit {
    editionsData: EditionModel[] = [];
    totalCount: number = 0;
    loading: boolean = true;
    showCreateEditDialog: boolean = false;
    editMode: boolean = false;
    form!: FormGroup;
    selectedEdition: EditionModel | null = null;

    columns: ColumnDef[] = [
        { field: 'name', header: 'Name', sortable: true, filterable: true, filterType: 'text' },
        { field: 'displayName', header: 'Display Name', sortable: true },
        { field: 'monthlyPrice', header: 'Monthly Price', sortable: true },
        { field: 'annualPrice', header: 'Annual Price', sortable: true },
        { field: 'trialDayCount', header: 'Trial Days' }
    ];

    actions: TableAction[] = [
        {
            label: 'Edit',
            icon: 'pi pi-pencil',
            command: (data: EditionModel) => {
                this.openUpdateDialog(data);
            }
        },
        {
            label: 'Delete',
            icon: 'pi pi-trash',
            outlined: true,
            severity: 'danger',
            command: (data: EditionModel) => {
                this.confirmDelete(data);
            }
        }
    ];

    constructor(
        private editionService: EditionService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private fb: FormBuilder
    ) {}

    ngOnInit(): void {
        this.initializeForm();
    }

    private initializeForm(): void {
        this.form = this.fb.group({
            id: [0],
            name: ['', [Validators.required, Validators.pattern(validationConstants.NAME_PATTERN)]],
            displayName: ['', [Validators.required]],
            monthlyPrice: [null],
            annualPrice: [null],
            trialDayCount: [null, [Validators.min(0)]],
            waitingDayAfterExpire: [null, [Validators.min(0)]],
            expiringEditionId: [null],
            isFree: [false]
        });

        // When isFree is checked, clear pricing
        this.form.get('isFree')?.valueChanges.subscribe((isFree: boolean) => {
            if (isFree) {
                this.form.patchValue({
                    monthlyPrice: null,
                    annualPrice: null,
                    trialDayCount: null
                });
            }
        });
    }

    getAllEditions(event: TableLazyLoadEvent): void {
        this.loading = true;
        this.editionService
            .getAllEditions({
                keyword: typeof event.globalFilter === 'string' ? event.globalFilter : undefined,
                skipCount: event.first ?? 0,
                maxResultCount: event.rows ?? 10
            })
            .subscribe({
                next: (res) => {
                    this.editionsData = res.result.items;
                    this.totalCount = res.result.totalCount;
                    this.loading = false;
                },
                error: () => {
                    this.loading = false;
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to load editions'
                    });
                }
            });
    }

    openCreateDialog(): void {
        this.editMode = false;
        this.form.reset({ id: 0, isFree: false });
        this.showCreateEditDialog = true;
    }

    openUpdateDialog(edition: EditionModel): void {
        this.editMode = true;
        this.selectedEdition = edition;
        this.form.patchValue({
            id: edition.id,
            name: edition.name,
            displayName: edition.displayName,
            monthlyPrice: edition.monthlyPrice,
            annualPrice: edition.annualPrice,
            trialDayCount: edition.trialDayCount,
            waitingDayAfterExpire: edition.waitingDayAfterExpire,
            expiringEditionId: edition.expiringEditionId,
            isFree: edition.isFree
        });
        this.showCreateEditDialog = true;
    }

    hideDialog(): void {
        this.showCreateEditDialog = false;
        this.form.reset({ id: 0, isFree: false });
        this.selectedEdition = null;
    }

    saveEdition(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.loading = true;
        this.editionService.saveEdition(this.form.value, this.editMode).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: this.editMode ? 'Edition updated successfully' : 'Edition created successfully'
                });
            },
            error: () => {
                this.loading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: this.editMode ? 'Failed to update edition' : 'Failed to create edition'
                });
            },
            complete: () => {
                this.getAllEditions({ first: 0, rows: 10 });
                this.hideDialog();
            }
        });
    }

    confirmDelete(edition: EditionModel): void {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete "${edition.displayName}"?`,
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            rejectButtonProps: {
                label: 'No',
                severity: 'secondary',
                variant: 'text'
            },
            acceptButtonProps: {
                severity: 'danger',
                label: 'Yes, Delete'
            },
            accept: () => {
                this.deleteEdition(edition.id);
            }
        });
    }

    deleteEdition(id: number): void {
        this.loading = true;
        this.editionService.deleteEdition(id).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Edition deleted successfully'
                });
            },
            error: () => {
                this.loading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to delete edition'
                });
            },
            complete: () => {
                this.getAllEditions({ first: 0, rows: 10 });
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
            if (field.errors['required']) {
                errors.push('This field is required.');
            }
            if (field.errors['pattern']) {
                errors.push('Only alphabetic characters are allowed.');
            }
            if (field.errors['min']) {
                errors.push('Value must be 0 or greater.');
            }
        }

        return errors;
    }

    formatPrice(price: number | null): string {
        if (price === null || price === undefined) {
            return 'N/A';
        }
        return `$${price.toFixed(2)}`;
    }
}
