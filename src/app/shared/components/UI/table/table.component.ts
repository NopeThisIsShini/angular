import { Component, ElementRef, input, viewChild, inject, computed, OnChanges, SimpleChanges } from '@angular/core';
import { Table, TableLazyLoadEvent, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ColumnDef, TableAction } from '@/app/shared/models';
import { PrimengImports } from '@/app/shared/primeng.import';
import { HasPermissionDirective } from '@/app/shared/directives';
import { PermissionService } from '@/app/shared/services';

@Component({
    selector: 'NG-Table',
    standalone: true,
    imports: [TableModule, ...PrimengImports, CommonModule, FormsModule, HasPermissionDirective],
    templateUrl: './table.component.html',
    styleUrl: './table.component.scss'
})
export class TableComponent {
    private permissionService = inject(PermissionService);
    
    table = viewChild<Table>('dt');
    filter = viewChild<ElementRef>('filter');

    value = input<any[]>([]);
    totalCount = input<number>(0);
    lazy = input<boolean>(true);
    loading = input<boolean>(false);
    columns = input<ColumnDef[]>([]);
    actions = input<TableAction[]>([]);
    rows = input<number>(10);
    showGlobalSearch = input<boolean>(true);
    globalSearchFields = input<string[]>([]);
    lazyLoadFn = input<(event: TableLazyLoadEvent) => void>();

    displayValue = computed(() => {
        if (this.loading()) {
            return new Array(4).fill({ isSkeleton: true });
        }
        return this.value();
    });

    canShowActions = computed(() => {
        const actions = this.actions();
        if (!actions || actions.length === 0) return false;
        
        const currentPermissions = this.permissionService.userPermissions();
        const lowerPermissions = currentPermissions.map(p => p.toLowerCase());

        return actions.some((action) => {
            if (action.permission) {
                return lowerPermissions.includes(action.permission.toLowerCase());
            }
            return true;
        });
    });

    onLazyLoad(event: TableLazyLoadEvent) {
        this.lazyLoadFn()?.(event);
    }

    getFieldValue(row: any, field?: string): any {
        if (row == null || !field) {
            return row;
        }

        const parts = field.split('.');
        let value: any = row;

        for (const part of parts) {
            if (value == null) return null;
            const idx = Number(part);
            value = Number.isNaN(idx) ? value[part] : value[idx];
        }

        return value;
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    clear(table: Table) {
        table.clear();
    }
}
