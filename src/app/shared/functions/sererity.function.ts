export function getSeverity(status: boolean | null) {
    switch (status) {
        case true:
            return 'success';
        case false:
        case null:
            return 'danger';

        default:
            return 'danger';
    }
}
