import { Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { Table, TableLazyLoadEvent, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableSkeletonComponent } from '@app/shared/skeleton';
import { ColumnDef, TableAction } from '@app/shared/models';
import { PrimengImports } from '@app/shared/primeng.import';

@Component({
  selector: 'NG-Table',
  standalone: true,
  imports: [TableModule, ...PrimengImports, CommonModule, FormsModule, TableSkeletonComponent],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss'
})
export class TableComponent implements OnChanges{
  @ViewChild('dt') table!: Table;
    @ViewChild('filter') filter!: ElementRef;
    @Input() value: any[] = [];
    @Input() totalCount: number = 0;
    @Input() lazy: boolean = true;
    @Input() loading: boolean = false;
    @Input() columns: ColumnDef[] = [];
    @Input() actions: TableAction[] = [];
    @Input() rows: number = 10;
    @Input() showGlobalSearch: boolean = true;
    @Input() globalSearchFields: string[] = [];

    @Input() lazyLoadFn!: (event: TableLazyLoadEvent) => void;

    onLazyLoad(event: TableLazyLoadEvent) {
        this.lazyLoadFn?.(event);
    }
    ngOnChanges(changes: SimpleChanges): void {}

    getFieldValue(row: any, field?: string): any {
        if (row == null || !field) {
            return row;
        }

        // support dot-paths and array indexes: "a.b.0.c"
        const parts = field.split('.');
        let value: any = row;

        for (const part of parts) {
            if (value == null) {
                return null;
            }
            // if part is numeric, treat as index
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
