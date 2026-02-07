import { Discount, DiscountType, Product } from './types';

export const SEED_CATALOG: Product[] = [
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

export function normalizeDiscount(discount: Discount): Discount {
  const normalizedValue = discount.value;

  switch (discount.type) {
    case 'percentage':
      return {
        type: 'percentage',
        value: clamp(normalizedValue, 0, 100),
      };
    case 'fixed':
      return {
        type: 'fixed',
        value: normalizedValue,
      };
    default:
      return {
        type: 'none',
        value: 0,
      };
  }
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function parseNumberInput(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function parseDiscountType(value: string): DiscountType {
  if (value === 'percentage' || value === 'fixed') {
    return value;
  }

  return 'none';
}
