import { Params } from '@angular/router';
import { Item } from './types';

export const SEED_ITEMS: Item[] = [
  { id: '1', title: 'MCH Keyboard', price: 129, category: 'electronics' },
  { id: '2', title: '4K Monitor', price: 549, category: 'electronics' },
  { id: '3', title: 'Running Shoes', price: 95, category: 'sports' },
  { id: '4', title: 'Yoga Mat', price: 42, category: 'sports' },
  { id: '5', title: 'Cookware Set', price: 189, category: 'home' },
  { id: '6', title: 'Desk Lamp', price: 38, category: 'home' },
  { id: '7', title: 'TS Handbook', price: 34, category: 'books' },
  { id: '8', title: 'Design Patterns Book', price: 48, category: 'books' },
  { id: '9', title: 'Office Chair', price: 399, category: 'home' },
];

export const QUERY_KEY_Q = 'q';
export const QUERY_KEY_CAT = 'cat';
export const QUERY_KEY_MIN = 'min';
export const QUERY_KEY_MAX = 'max';

export function areQueryParamsEqual(left: Params, right: Params): boolean {
  const keys = new Set([...Object.keys(left), ...Object.keys(right)]);

  for (const key of keys) {
    if (left[key] !== right[key]) {
      return false;
    }
  }

  return true;
}
export function normalizeCategory(value: string | null) {
  if (value === null) {
    return 'all';
  }

  return value === 'electronics' || value === 'books' || value === 'sports' || value === 'home'
    ? value
    : 'all';
}

export function parseQueryParam(value: unknown): string | null {
  if (typeof value === 'string') {
    return value;
  }

  return null;
}
