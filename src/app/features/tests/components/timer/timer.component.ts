import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-test-timer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <p
      class="rounded-md border px-3 py-1 text-sm font-semibold"
      [class.border-destructive]="isCritical()"
      [class.text-destructive]="isCritical()"
      [class.border-border]="!isCritical()"
      [class.text-foreground]="!isCritical()"
    >
      {{ formattedTime() }}
    </p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimerComponent {
  readonly remainingSeconds = input.required<number>();
  readonly isCritical = computed(() => this.remainingSeconds() <= 60);
  readonly formattedTime = computed(() => formatTime(this.remainingSeconds()));
}

function formatTime(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }

  return `${pad(minutes)}:${pad(seconds)}`;
}

function pad(value: number): string {
  return value.toString().padStart(2, '0');
}
