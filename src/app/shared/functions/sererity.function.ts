export function getSeverity(status: boolean | string | null) {
    switch (status) {
        case true:
        case 'active':
            return 'success';
        case false:
        case 'inactive':
        case null:
            return 'danger';

        default:
            return 'danger';
    }
}
