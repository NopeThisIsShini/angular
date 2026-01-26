import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressBarModule } from 'primeng/progressbar';
import { Event, NavigationEnd, NavigationError, NavigationStart, Router, RouterModule, RouterOutlet } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { environment } from '@env/environment';
import { AppConfigurator } from '@app/layout/component/app.configurator';
import { FaviconService, LoadingService } from '@app/shared/services';
import { CustomIconDirective } from '@app/shared/directives';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterModule, RouterOutlet, ToastModule, AppConfigurator, ConfirmDialogModule, ProgressBarModule, CommonModule, CustomIconDirective],
    template: `
        <div [customIconGlobal]="true" class="h-full">
            @if (loadingService.loading()) {
                <p-progressbar mode="indeterminate" [style]="{ height: '4px', position: 'fixed', top: '0', left: '0', width: '100%', 'z-index': '9999' }" />
            }
            <router-outlet />
            <app-configurator />
            <p-confirmdialog />
            <p-toast />
        </div>
    `
})
export class AppComponent implements OnInit {
    private favicon = inject(FaviconService);
    public loadingService = inject(LoadingService);
    private router = inject(Router);

    ngOnInit() {
        console.log(environment.apiBaseUrl);
        this.favicon.setFavicon('/assets/favicon.ico');

        this.router.events.subscribe((event: Event) => {
            if (event instanceof NavigationStart) {
                this.loadingService.show();
            } else if (event instanceof NavigationEnd || event instanceof NavigationError) {
                this.loadingService.hide();
            }
        });
    }
}
