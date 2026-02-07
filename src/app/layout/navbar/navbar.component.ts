import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeToggleComponent } from '../../shared/components/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, ThemeToggleComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<nav class="border-b border-border bg-card/95 text-foreground shadow-sm overflow-auto">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex h-16 items-center justify-between gap-4">
        <div class="flex items-center gap-8">
          <h1 class="text-xl font-semibold tracking-tight text-primary">AngularDemos</h1>

          <div class="flex gap-2">
            @for (link of navLinks; track link.path) {
              <a
                [routerLink]="link.path"
                routerLinkActive="bg-muted text-foreground"
                [routerLinkActiveOptions]="{ exact: true }"
                class="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {{ link.label }}
              </a>
            }
          </div>
        </div>

        <app-theme-toggle />
      </div>
    </div>
  </nav> `,
})
export class NavbarComponent {
  navLinks = [
    { path: '/cart', label: 'Cart' },
    { path: '/todo', label: 'Todo List' },
  ];
}
