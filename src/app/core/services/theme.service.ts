import { Injectable, signal, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type ThemeMode = 'light' | 'dark';
export type DisplayMode = 'table' | 'card';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private platformId = inject(PLATFORM_ID);
  private _themeMode = signal<ThemeMode>('light');
  private _displayMode = signal<DisplayMode>('table');

  readonly themeMode = this._themeMode.asReadonly();
  readonly displayMode = this._displayMode.asReadonly();

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const savedTheme = localStorage.getItem('themeMode') as ThemeMode | null;
      if (savedTheme) {
        this._themeMode.set(savedTheme);
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this._themeMode.set(prefersDark ? 'dark' : 'light');
      }

      const savedDisplay = localStorage.getItem('displayMode') as DisplayMode | null;
      if (savedDisplay) {
        this._displayMode.set(savedDisplay);
      }

      effect(() => {
        const mode = this._themeMode();
        document.documentElement.classList.toggle('dark-mode', mode === 'dark');
        localStorage.setItem('themeMode', mode);
      });

      effect(() => {
        localStorage.setItem('displayMode', this._displayMode());
      });
    }
  }

  setThemeMode(mode: ThemeMode): void {
    this._themeMode.set(mode);
  }

  setDisplayMode(mode: DisplayMode): void {
    this._displayMode.set(mode);
  }
}
