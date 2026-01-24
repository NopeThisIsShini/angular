import { Component, OnInit, inject } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { SharedModule } from '@app/shared/shared.imports';
import { ColumnDef, TableAction } from '@app/shared/models';
import { OrganizationTreeComponent } from '@app/shared/components/organization-tree/organization-tree.component';
import { OrganizationService } from '@app/pages/services/api';
import { OrganizationUnitTree, OrganizationUnitUser } from '@app/pages/models';

@Component({
    selector: 'app-organization',
    standalone: true,
    imports: [
        SharedModule,
        OrganizationTreeComponent
    ],
    providers: [ConfirmationService, MessageService],
    templateUrl: './organization.component.html',
    styleUrl: './organization.component.scss'
})
export class OrganizationComponent implements OnInit {
    private organizationService = inject(OrganizationService);
    private confirmationService = inject(ConfirmationService);
    private messageService = inject(MessageService);

    organizationTree: OrganizationUnitTree[] = [];
    selectedUnit: OrganizationUnitTree | null = null;
    unitUsers: OrganizationUnitUser[] = [];
    totalCount = 0;
    loading = false;

    columns: ColumnDef[] = [
        { field: 'userName', header: 'UserName' },
        { field: 'name', header: 'First Name' },
        { field: 'surname', header: 'Last Name' },
        { field: 'emailAddress', header: 'Email' },
        { field: 'addedTime', header: 'Added At' }
    ];

    actions: TableAction[] = [
        {
            label: 'Remove',
            icon: 'pi pi-times',
            severity: 'danger',
            tooltip: 'Remove from unit',
            command: (user: OrganizationUnitUser) => this.removeUser(user)
        }
    ];

    // Dialog states
    unitDialogVisible = false;
    editMode = false;
    unitForm = { displayName: '' };
    parentUnit: OrganizationUnitTree | null = null;

    ngOnInit(): void {
        this.loadTree();
    }

    loadTree(): void {
        this.organizationService.getTree().subscribe({
            next: (res: any) => {
                this.organizationTree = res.result.items;
            }
        });
    }

    onNodeSelect(unit: OrganizationUnitTree): void {
        this.selectedUnit = unit;
        this.loadUnitUsers(unit.id);
    }

    loadUnitUsers(unitId: number): void {
        this.loading = true;
        this.organizationService.getUsers(unitId).subscribe({
            next: (res: any) => {
                this.unitUsers = res.result.items;
                this.totalCount = res.result.totalCount;
            },
            complete: () => this.loading = false
        });
    }

    // Create root OU
    createRootUnit(): void {
        this.editMode = false;
        this.parentUnit = null;
        this.unitForm = { displayName: '' };
        this.unitDialogVisible = true;
    }

    // Add child to selected OU
    onAddChild(parent: OrganizationUnitTree): void {
        this.editMode = false;
        this.parentUnit = parent;
        this.unitForm = { displayName: '' };
        this.unitDialogVisible = true;
    }

    // Edit OU
    onEdit(unit: OrganizationUnitTree): void {
        this.editMode = true;
        this.parentUnit = null;
        this.unitForm = { displayName: unit.displayName };
        this.unitDialogVisible = true;
    }

    // Delete OU
    onDelete(unit: OrganizationUnitTree): void {
        const hasChildren = unit.children && unit.children.length > 0;
        this.confirmationService.confirm({
            message: hasChildren
                ? `This will delete "${unit.displayName}" and all its children. Are you sure?`
                : `Are you sure you want to delete "${unit.displayName}"?`,
            header: 'Confirm Delete',
            icon: hasChildren ? 'pi pi-exclamation-triangle' : 'pi pi-trash',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                console.log('Deleting unit:', unit);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Deleted',
                    detail: `${unit.displayName} has been deleted`
                });
                this.loadTree();
            }
        });
    }

    removeUser(user: OrganizationUnitUser): void {
        this.confirmationService.confirm({
            message: `Are you sure you want to remove "${user.name}" from this unit?`,
            header: 'Confirm Removal',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                console.log('Removing user from OU:', user.userId);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Removed',
                    detail: 'User removed from unit successfully'
                });
                if (this.selectedUnit) this.loadUnitUsers(this.selectedUnit.id);
            }
        });
    }

    // Save OU
    saveUnit(): void {
        if (this.editMode) {
            console.log('Updating unit:', this.selectedUnit?.id, this.unitForm);
            this.messageService.add({
                severity: 'success',
                summary: 'Updated',
                detail: `${this.unitForm.displayName} has been updated`
            });
        } else {
            console.log('Creating unit:', this.parentUnit?.id, this.unitForm);
            this.messageService.add({
                severity: 'success',
                summary: 'Created',
                detail: `${this.unitForm.displayName} has been created`
            });
        }
        this.unitDialogVisible = false;
        this.loadTree();
    }

    // Get breadcrumb path for selected unit
    getUnitPath(): string {
        if (!this.selectedUnit) return '';
        return this.selectedUnit.path
            .split('/')
            .filter((p) => p)
            .map(() => '...')
            .join(' > ');
    }
}
