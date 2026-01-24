import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@app/shared/shared.imports';
import { TenantService, EditionService } from '@app/pages/services/api';
import { Tenant, Edition } from '@app/pages/models';
import { LOCAL_ROUTES } from '@app/utils/routes';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [SharedModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit{
private tenantService = inject(TenantService);
    private editionService = inject(EditionService);

    tenants: Tenant[] = [];
    editions: Edition[] = [];
    totalTenants = 0;
    activeTenants = 0;
    totalUsers = 0;

    tenantsRoute = LOCAL_ROUTES.TENANTS;
    editionsRoute = LOCAL_ROUTES.EDITIONS;

    ngOnInit(): void {
        this.loadData();
    }

    loadData(): void {
        this.tenantService.getAll({}).subscribe({
            next: (res) => {
                this.tenants = res.result.items;
                this.totalTenants = res.result.totalCount;
                this.activeTenants = this.tenants.filter((t) => t.isActive).length;
                this.totalUsers = this.tenants.reduce((sum, t) => sum + (t.userCount || 0), 0);
            }
        });

        this.editionService.getAll().subscribe({
            next: (res) => {
                this.editions = res.result.items;
            }
        });
    }
}
