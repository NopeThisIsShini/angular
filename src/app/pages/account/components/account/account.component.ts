import { Component, computed, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { SharedModule } from '@/app/shared/shared.imports';
import { LOCAL_ROUTES } from '@/app/utils/routes';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';

interface MenuItem {
    route: string;
    label: string;
    icon: string;
}

@Component({
    selector: 'app-account',
    imports: [SharedModule, RouterOutlet],
    templateUrl: './account.component.html',
    styleUrl: './account.component.scss'
})
export class AccountComponent {
    private router = inject(Router);

    tabs: MenuItem[] = [
        { route: LOCAL_ROUTES.PROFILE, label: 'Profile', icon: 'pi pi-user' },
        { route: LOCAL_ROUTES.SMTP, label: 'Smtp', icon: 'pi pi-envelope' }
    ];

    // Reactive path tracking
    private currentUrl = toSignal(
        this.router.events.pipe(
            filter((event) => event instanceof NavigationEnd),
            map((event: NavigationEnd) => event.urlAfterRedirects)
        ),
        { initialValue: this.router.url }
    );

    activeTab = computed(() => {
        const url = this.currentUrl();
        const lastSegment = url.split('/').pop();
        const matchedTab = this.tabs.find((tab) => tab.route.endsWith(lastSegment as string));
        return matchedTab ? matchedTab.route : this.tabs[0].route;
    });
}
