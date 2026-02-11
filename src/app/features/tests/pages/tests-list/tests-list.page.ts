import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { take } from 'rxjs';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { InfoPanelComponent } from '../../../../shared/components/info-panel/info-panel.component';
import { TestSummary } from '../../models/test.models';
import { TestApiService } from '../../services/test-api.service';

@Component({
  selector: 'app-tests-list-page',
  standalone: true,
  imports: [CommonModule, ButtonComponent, InfoPanelComponent],
  template: `
    <section class="mx-auto w-full max-w-4xl space-y-4">
      <header class="space-y-1">
        <h2 class="text-2xl font-semibold text-foreground">Online Tests</h2>
        <p class="text-sm text-muted-foreground">Choose a test and start solving.</p>
      </header>

      @if (isLoading()) {
        <app-info-panel> Loading tests... </app-info-panel>
      } @else if (!tests().length) {
        <app-info-panel> No tests available right now. </app-info-panel>
      } @else {
        <ul class="space-y-3">
          @for (test of tests(); track test.id) {
            <li
              class="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-card p-4 shadow-sm"
            >
              <div>
                <p class="text-base font-semibold text-card-foreground">{{ test.name }}</p>
                <p class="text-sm text-muted-foreground">
                  {{ test.questionCount }} questions · {{ test.durationMinutes }} minutes
                </p>
              </div>

              <app-button variant="primary" (click)="startTest(test.id)">Start Test</app-button>
            </li>
          }
        </ul>
      }
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestsListPageComponent implements OnInit {
  private readonly testApiService = inject(TestApiService);
  private readonly router = inject(Router);

  readonly tests = signal<TestSummary[]>([]);
  readonly isLoading = signal(true);

  ngOnInit(): void {
    this.testApiService
      .getTests()
      .pipe(take(1))
      .subscribe((tests) => {
        this.tests.set(tests);
        this.isLoading.set(false);
      });
  }

  startTest(testId: string): void {
    void this.router.navigate(['/tests', testId, 'start']);
  }
}
