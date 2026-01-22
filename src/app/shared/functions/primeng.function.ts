import { FilterMetadata } from 'primeng/api';

export function getFilterValues(event: any, field: string) {
    const filters = event?.filters?.[field] as FilterMetadata[] | undefined;
    const value = filters?.find((f) => f?.value)?.value;

    if (!value) return [];

    return Array.isArray(value) ? value : [value];
}
