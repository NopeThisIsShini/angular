import type { Preview } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import Aura from '@primeng/themes/aura';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { authInterceptor, baseUrlInterceptor, errorInterceptor, loadingInterceptor } from '@/app/utils/interceptor';

const preview: Preview = {
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i
            }
        }
    },
    decorators: [
        applicationConfig({
            providers: [
                provideAnimationsAsync(),
                provideHttpClient(withFetch(), withInterceptors([baseUrlInterceptor, errorInterceptor, authInterceptor, loadingInterceptor])),
                provideRouter([]),
                providePrimeNG({
                    theme: {
                        preset: Aura,
                        options: {
                            darkModeSelector: '.app-dark',
                            ripple: true
                        }
                    }
                }),
                MessageService,
                DialogService,
                ConfirmationService
            ]
        })
    ]
};

export default preview;
