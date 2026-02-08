import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { parseNumber } from '../../shared/utils';
import { SearchFilterStore } from './search-filter.store';

@Component({
  selector: 'app-search-filter-page',
  standalone: true,
  imports: [CurrencyPipe],
  template: `
    <section class="mx-auto w-full max-w-4xl space-y-4">
      <header class="space-y-1">
        <h2 class="text-2xl font-semibold text-foreground">Search & Filter</h2>
        <p class="text-sm text-muted-foreground">
          Showing {{ store.filteredResults().length }} of {{ store.items().length }}
        </p>
      </header>

      <div class="grid gap-3 rounded-lg border border-border bg-card shadow-sm p-4 md:grid-cols-4">
        <label class="md:col-span-2">
          <span class="mb-1 block text-xs font-medium text-muted-foreground">Search</span>
          <input
            type="text"
            placeholder="Search by title..."
            class="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground "
            [value]="store.searchQuery()"
            (input)="onSearchInput($event)"
          />
        </label>

        <label>
          <span class="mb-1 block text-xs font-medium text-muted-foreground">Category</span>
          <select
            class="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground "
            [value]="store.category()"
            (change)="onCategoryChange($event)"
          >
            <option value="all">All</option>
            @for (cat of store.categories(); track cat) {
              <option [value]="cat">{{ cat }}</option>
            }
          </select>
        </label>

        <div class="grid grid-cols-2 gap-3">
          <label>
            <span class="mb-1 block text-xs font-medium text-muted-foreground">Min</span>
            <input
              type="number"
              class="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground "
              [value]="store.minPrice() ?? ''"
              (input)="onMinPriceInput($event)"
            />
          </label>

          <label>
            <span class="mb-1 block text-xs font-medium text-muted-foreground">Max</span>
            <input
              type="number"
              class="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground "
              [value]="store.maxPrice() ?? ''"
              (input)="onMaxPriceInput($event)"
            />
          </label>
        </div>
      </div>

      @if (!store.filteredResults().length) {
        <div
          class="rounded-lg border border-dashed border-border bg-card shadow-sm p-8 text-center text-sm text-muted-foreground"
        >
          No items found.
        </div>
      } @else {
        <ul class="space-y-2">
          @for (item of store.filteredResults(); track item.id) {
            <li class="rounded-lg border border-border bg-card p-4 shadow-sm">
              <div class="flex items-center justify-between gap-4">
                <div>
                  <p class="font-medium text-foreground">{{ item.title }}</p>
                  <p class="text-xs capitalize text-muted-foreground">{{ item.category }}</p>
                </div>
                <p class="text-sm font-semibold text-primary">
                  {{ item.price | currency: 'USD' : 'symbol' : '1.0-2' }}
                </p>
              </div>
            </li>
          }
        </ul>
      }
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchFilterPageComponent {
  readonly store = inject(SearchFilterStore);
  private readonly route = inject(ActivatedRoute);

  constructor() {
    this.store.updateFromQueryParams(this.route.snapshot.queryParamMap);
  }

  onSearchInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement | null;
    this.store.setSearchQuery(inputElement?.value ?? '');
  }

  onCategoryChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement | null;
    this.store.setCategory(selectElement?.value ?? 'all');
  }

  onMinPriceInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement | null;
    this.store.setMinPrice(parseNumber(inputElement?.value ?? ''));
  }

  onMaxPriceInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement | null;
    this.store.setMaxPrice(parseNumber(inputElement?.value ?? ''));
  }
}
