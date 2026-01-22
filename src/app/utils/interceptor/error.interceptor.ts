import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { UnauthorisedPopupComponent } from '../../shared/components/unauthorised-popup/unauthorised-popup.component';
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const msgServ = inject(MessageService);
    const dialogServ = inject(DialogService);
    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            let errorMessage = '';

            // Client-side error
            if (error.error instanceof ErrorEvent) {
                msgServ.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'An error occurred'
                });
            }
            // Server-side error
            else {
                if (error.status === 401 || error.statusText.toLowerCase() === 'unauthorized') {
                    dialogServ.open(UnauthorisedPopupComponent, {
                        header: 'Unauthorized',
                        showHeader: false,
                        modal: true, // makes it modal (blocks background interaction)
                        closable: false, // hides the close (X) icon
                        dismissableMask: false, // prevents closing when clicking outside
                        closeOnEscape: false, // disables closing with Esc key
                        styleClass: 'unauthorized-dialog' // optional: custom styles if needed
                    });
                } else {
                    errorMessage = `${error.error?.message}`;
                }
            }
            return throwError(() => errorMessage);
        })
    );
};
