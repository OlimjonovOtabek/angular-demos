import { computed, Injectable, signal } from '@angular/core';
import { CartItem, Discount, Product } from './types';
import { clamp, normalizeDiscount, SEED_CATALOG } from './utils';


@Injectable({ providedIn: 'root' })
export class CartStore {
  readonly products = signal<Product[]>(SEED_CATALOG);
  readonly cart = signal<CartItem[]>([]);
  readonly discount = signal<Discount>({ type: 'none', value: 0 });

  readonly itemCount = computed(() =>
    this.cart().reduce((count, item) => count + item.quantity, 0),
  );

  readonly subtotal = computed(() =>
    this.cart().reduce((sum, item) => sum + item.price * item.quantity, 0),
  );

  readonly discountAmount = computed(() => {
    const normalizedDiscount = normalizeDiscount(this.discount());
    const subtotal = this.subtotal();
    let amount = 0;

    switch (normalizedDiscount.type) {
      case 'percentage':
        amount = subtotal * (normalizedDiscount.value / 100);
        break;
      case 'fixed':
        amount = normalizedDiscount.value;
        break;
      default:
        amount = 0;
    }

    return clamp(amount, 0, subtotal);
  });

  readonly total = computed(() => Math.max(0, this.subtotal() - this.discountAmount()));
  readonly canCheckout = computed(() => this.itemCount() > 0);

  addToCart(productId: string): void {
    const product = this.products().find((item) => item.id === productId);

    if (!product) {
      return;
    }

    this.cart.update((items) => {
      const existingItem = items.find((item) => item.productId === productId);

      if (existingItem) {
        return items.map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }

      return [
        ...items,
        {
          productId: product.id,
          title: product.title,
          price: product.price,
          quantity: 1,
        },
      ];
    });
  }

  removeFromCart(productId: string): void {
    this.cart.update((items) => items.filter((item) => item.productId !== productId));
  }

  updateQuantity(productId: string, quantity: number): void {
    const normalizedQuantity = Math.max(0, Math.floor(quantity));

    if (normalizedQuantity === 0) {
      this.removeFromCart(productId);
      return;
    }

    this.cart.update((items) =>
      items.map((item) =>
        item.productId === productId ? { ...item, quantity: normalizedQuantity } : item,
      ),
    );
  }

  clearCart(): void {
    this.cart.set([]);
  }

  setDiscount(discount: Discount): void {
    this.discount.set(normalizeDiscount(discount));
  }
}


