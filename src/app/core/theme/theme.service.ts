import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isTheme, THEME_STORAGE_KEY, type Theme } from './theme.constants';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);

  readonly theme = signal<Theme>(this.resolveInitialTheme());

  constructor() {
    effect(() => {
      const nextTheme = this.theme();

      this.document.documentElement.classList.toggle('dark', nextTheme === 'dark');
      this.persistTheme(nextTheme);
    });
  }

  toggleTheme(): void {
    this.theme.update((current) => (current === 'dark' ? 'light' : 'dark'));
  }

  setTheme(nextTheme: Theme): void {
    this.theme.set(nextTheme);
  }

  private resolveInitialTheme(): Theme {
    const storedTheme = this.readStoredTheme();
    if (storedTheme) {
      return storedTheme;
    }

    return this.systemPrefersDark() ? 'dark' : 'light';
  }

  private readStoredTheme(): Theme | null {
    try {
      const storedValue = localStorage.getItem(THEME_STORAGE_KEY);
      return isTheme(storedValue) ? storedValue : null;
    } catch {
      return null;
    }
  }

  private persistTheme(theme: Theme): void {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {}
  }

  private systemPrefersDark(): boolean {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return false;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
}
