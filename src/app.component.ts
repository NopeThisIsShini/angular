import { Component, inject, OnInit } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { environment } from '@env/environment';
import { AppConfigurator } from '@app/layout/component/app.configurator';


@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterModule, RouterOutlet, ToastModule, AppConfigurator, ConfirmDialogModule],
    template: `
        <router-outlet />
        <app-configurator />
        <p-confirmdialog />
        <p-toast />
    `
})
export class AppComponent implements OnInit {
    ngOnInit() {
        console.log(environment.apiBaseUrl);
        
    }
}
