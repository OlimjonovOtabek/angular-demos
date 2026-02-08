import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { ParamMap, Params, Router } from '@angular/router';
import { parseNumber } from '../../shared/utils';
import { Item, ItemCategory } from './types';
import {
  areQueryParamsEqual,
  normalizeCategory,
  parseQueryParam,
  QUERY_KEY_CAT,
  QUERY_KEY_MAX,
  QUERY_KEY_MIN,
  QUERY_KEY_Q,
  SEED_ITEMS,
} from './utils';

@Injectable({ providedIn: 'root' })
export class SearchFilterStore {
  private readonly router = inject(Router);

  readonly items = signal<Item[]>(SEED_ITEMS);
  readonly searchQuery = signal<string>('');
  readonly category = signal<string>('all');
  readonly minPrice = signal<number | null>(null);
  readonly maxPrice = signal<number | null>(null);
  readonly updated = signal(false);

  readonly categories = computed<ItemCategory[]>(() =>
    Array.from(new Set(this.items().map((item) => item.category))),
  );

  readonly filteredResults = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const selectedCategory = this.category();
    const min = this.minPrice();
    const rawMax = this.maxPrice();

    const max = min !== null && rawMax !== null && min > rawMax ? null : rawMax;

    return this.items().filter((item) => {
      const matchesQuery = !query || item.title.toLowerCase().includes(query);
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesMin = min === null || item.price >= min;
      const matchesMax = max === null || item.price <= max;

      return matchesQuery && matchesCategory && matchesMin && matchesMax;
    });
  });

  constructor() {
    effect(() => {
      if (!this.updated()) {
        return;
      }

      const desired = this.desiredQueryParams();
      const current = this.currentFilterQueryParams();

      if (areQueryParamsEqual(current, desired)) {
        return;
      }

      void this.router.navigate([], {
        queryParams: desired,
        replaceUrl: true,
      });
    });
  }

  updateFromQueryParams(paramMap: ParamMap): void {
    const nextSearchQuery = (paramMap.get(QUERY_KEY_Q) ?? '').trim();
    const nextCategory = normalizeCategory(paramMap.get(QUERY_KEY_CAT));
    const nextMinPrice = parseNumber(paramMap.get(QUERY_KEY_MIN));
    const nextMaxPrice = parseNumber(paramMap.get(QUERY_KEY_MAX));

    this.searchQuery.set(nextSearchQuery);
    this.category.set(nextCategory);
    this.minPrice.set(nextMinPrice);
    this.maxPrice.set(nextMaxPrice);
    this.updated.set(true);
  }

  setSearchQuery(value: string): void {
    this.searchQuery.set(value);
  }

  setCategory(value: string): void {
    this.category.set(normalizeCategory(value));
  }

  setMinPrice(value: number | null): void {
    this.minPrice.set(value);
  }

  setMaxPrice(value: number | null): void {
    this.maxPrice.set(value);
  }

  private desiredQueryParams(): Params {
    const params: Params = {};
    const q = this.searchQuery().trim();
    const cat = this.category();
    const min = this.minPrice();
    const rawMax = this.maxPrice();
    const max = min !== null && rawMax !== null && min > rawMax ? null : rawMax;

    if (q) {
      params[QUERY_KEY_Q] = q;
    }

    if (cat !== 'all') {
      params[QUERY_KEY_CAT] = cat;
    }

    if (min !== null) {
      params[QUERY_KEY_MIN] = String(min);
    }

    if (max !== null) {
      params[QUERY_KEY_MAX] = String(max);
    }

    return params;
  }

  private currentFilterQueryParams(): Params {
    const current = this.router.parseUrl(this.router.url).queryParams;
    const normalized: Params = {};

    const q = parseQueryParam(current[QUERY_KEY_Q])?.trim();
    const cat = normalizeCategory(parseQueryParam(current[QUERY_KEY_CAT]));
    const min = parseNumber(parseQueryParam(current[QUERY_KEY_MIN]));
    const rawMax = parseNumber(parseQueryParam(current[QUERY_KEY_MAX]));
    const max = min !== null && rawMax !== null && min > rawMax ? null : rawMax;

    if (q) {
      normalized[QUERY_KEY_Q] = q;
    }

    if (cat !== 'all') {
      normalized[QUERY_KEY_CAT] = cat;
    }

    if (min !== null) {
      normalized[QUERY_KEY_MIN] = String(min);
    }

    if (max !== null) {
      normalized[QUERY_KEY_MAX] = String(max);
    }

    return normalized;
  }
}
