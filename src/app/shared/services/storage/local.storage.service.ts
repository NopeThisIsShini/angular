import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class LocalStorageService {
    constructor() {
        if (window && !window.localStorage) {
            console.error('Browser does not support localstorage');
        }
    }

    setItem(key: string, value: string): void {
        localStorage.setItem(key, value);
    }

    getItem(key: string): string | null {
        return localStorage.getItem(key);
    }

    removeItem(key: string): void {
        localStorage.removeItem(key);
    }

    clear(): void {
        localStorage.clear();
    }
}
