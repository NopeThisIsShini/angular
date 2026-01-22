import { CanDeactivateFn } from '@angular/router';
import { UnsavedChanges } from '../interface/unsaved-changes.interface';

export const unsavedChangesGuard: CanDeactivateFn<UnsavedChanges> = (component, currentRoute, currentState, nextState) => {
    if (component.hasUnsavedChanges()) {
        return confirm('You have unsaved changes. Do you really want to leave?');
    }
    return true; // Allow navigation if no changes
};
