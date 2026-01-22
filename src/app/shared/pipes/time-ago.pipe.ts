import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'timeAgo',
    standalone: true
})
export class TimeAgoPipe implements PipeTransform {
    transform(value: Date | string | number): string {
        if (!value) return 'Just now';

        const now = new Date().getTime();
        const past = new Date(value).getTime();
        const diffInSeconds = Math.floor((now - past) / 1000);

        if (diffInSeconds < 60) return `${diffInSeconds} sec ago`;
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;

        return `${Math.floor(diffInSeconds / 2592000)} months ago`;
    }
}
