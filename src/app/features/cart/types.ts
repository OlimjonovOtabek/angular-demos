export interface Product {
  id: string;
  title: string;
  price: number;
  category?: string;
}

export interface CartItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
}

export type DiscountType = 'none' | 'percentage' | 'fixed';

export interface Discount {
  type: DiscountType;
  value: number;
}