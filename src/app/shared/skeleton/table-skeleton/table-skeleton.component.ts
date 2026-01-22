import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Skeleton } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';

@Component({
    selector: 'app-table-skeleton',
    standalone: true,
    imports: [CommonModule, TableModule, Skeleton],
    templateUrl: './table-skeleton.component.html',
    styleUrl: './table-skeleton.component.scss'
})
export class TableSkeletonComponent {
    @Input() colspan: number = 6; // Default colspan value

    get skeletonColumns() {
        return Array(this.colspan).fill(0);
    }
}
