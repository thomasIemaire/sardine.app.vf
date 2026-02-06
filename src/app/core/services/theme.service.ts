import { effect, Injectable, signal } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class ThemeService {
    private readonly STORAGE_KEY = 'sardine-theme';

    darkMode = signal(this.loadTheme());

    constructor() {
        effect(() => {
            const isDark = this.darkMode();
            this.saveTheme(isDark);
            this.applyTheme(isDark);
        });
    }

    toggle(): void {
        this.darkMode.update(v => !v);
    }

    private loadTheme(): boolean {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored !== null) {
            return stored === 'dark';
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    private saveTheme(isDark: boolean): void {
        localStorage.setItem(this.STORAGE_KEY, isDark ? 'dark' : 'light');
    }

    private applyTheme(isDark: boolean): void {
        document.documentElement.classList.toggle('dark-mode', isDark);
    }
}
