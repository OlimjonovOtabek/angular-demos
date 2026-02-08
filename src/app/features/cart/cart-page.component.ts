import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { parseNumber } from '../../shared/utils';
import { CartStore } from './cart.store';
import { DiscountType } from './types';
import { parseDiscountType } from './utils';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [CurrencyPipe],
  template: `
    <section class="mx-auto w-full max-w-6xl space-y-6">
      <header class="space-y-1">
        <h2 class="text-2xl font-semibold tracking-tight text-foreground">Shopping Cart</h2>
        <p class="text-sm text-muted-foreground">
          Add items, adjust quantities, and apply simple discounts.
        </p>
      </header>

      <div class="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <section class="space-y-3 rounded-xl border border-border bg-card p-4 shadow-sm">
          <h3 class="text-base font-semibold text-card-foreground">Products</h3>

          <ul class="space-y-2">
            @for (product of store.products(); track product.id) {
              <li
                class="flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-background p-3"
              >
                <div>
                  <p class="text-sm font-medium text-foreground">{{ product.title }}</p>
                  <p class="text-xs capitalize text-muted-foreground">
                    {{ product.category ?? 'general' }}
                  </p>
                </div>

                <div class="flex items-center gap-3">
                  <span class="text-sm font-medium text-primary">
                    {{ product.price | currency: 'USD' : 'symbol' : '1.0-2' }}
                  </span>
                  <button
                    type="button"
                    class="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground  hover:bg-primary/90"
                    (click)="store.addToCart(product.id)"
                  >
                    Add to cart
                  </button>
                </div>
              </li>
            }
          </ul>
        </section>

        <section class="space-y-3 rounded-xl border border-border bg-card p-4 shadow-sm">
          <h3 class="text-base font-semibold text-card-foreground">Cart</h3>

          @if (store.cart().length === 0) {
            <p
              class="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground"
            >
              Cart is empty.
            </p>
          } @else {
            <ul class="space-y-2">
              @for (item of store.cart(); track item.productId) {
                <li class="rounded-lg border border-border/70 bg-background p-3">
                  <div class="flex items-start justify-between gap-3">
                    <div>
                      <p class="text-sm font-medium text-foreground">{{ item.title }}</p>
                      <p class="text-xs text-muted-foreground">
                        {{ item.price | currency: 'USD' : 'symbol' : '1.0-2' }} each
                      </p>
                    </div>

                    <button
                      type="button"
                      class="rounded px-2 py-1 text-xs text-muted-foreground  hover:bg-muted hover:text-foreground"
                      (click)="store.removeFromCart(item.productId)"
                    >
                      Remove
                    </button>
                  </div>

                  <div class="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      class="h-8 w-8 rounded border border-border text-sm  hover:bg-muted"
                      (click)="store.updateQuantity(item.productId, item.quantity - 1)"
                    >
                      -
                    </button>

                    <input
                      type="number"
                      min="0"
                      class="h-8 w-16 rounded border border-border bg-card px-2 text-center text-sm text-foreground"
                      [value]="item.quantity"
                      (input)="onQuantityInput(item.productId, $event)"
                    />

                    <button
                      type="button"
                      class="h-8 w-8 rounded border border-border text-sm  hover:bg-muted"
                      (click)="store.updateQuantity(item.productId, item.quantity + 1)"
                    >
                      +
                    </button>
                  </div>
                </li>
              }
            </ul>
          }
        </section>
      </div>

      <section class="rounded-xl border border-border bg-card p-4 shadow-sm">
        <h3 class="text-base font-semibold text-card-foreground">Summary</h3>

        <div class="mt-4 grid gap-3 md:grid-cols-[1fr_1fr]">
          <div class="space-y-2 rounded-lg border border-border/70 bg-background p-3 text-sm">
            <div class="flex items-center justify-between">
              <span class="text-muted-foreground">Item count</span>
              <span class="font-medium text-foreground">{{ store.itemCount() }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-muted-foreground">Subtotal</span>
              <span class="font-medium text-foreground">
                {{ store.subtotal() | currency: 'USD' : 'symbol' : '1.0-2' }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-muted-foreground">Discount</span>
              <span class="font-medium text-foreground">
                -{{ store.discountAmount() | currency: 'USD' : 'symbol' : '1.0-2' }}
              </span>
            </div>
            <div class="flex items-center justify-between border-t border-border pt-2">
              <span class="font-semibold text-foreground">Total</span>
              <span class="font-semibold text-primary">
                {{ store.total() | currency: 'USD' : 'symbol' : '1.0-2' }}
              </span>
            </div>
          </div>

          <div class="space-y-3 rounded-lg border border-border/70 bg-background p-3">
            <label class="block">
              <span class="mb-1 block text-xs font-medium text-muted-foreground "
                >Discount type</span
              >
              <select
                class="h-10 w-full rounded-md border border-border bg-card px-3 text-sm text-foreground"
                [value]="store.discount().type"
                (change)="onDiscountTypeChange($event)"
              >
                <option value="none">None</option>
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed amount</option>
              </select>
            </label>

            @if (store.discount().type !== 'none') {
              <label class="block">
                <span class="mb-1 block text-xs font-medium text-muted-foreground">
                  @if (store.discount().type === 'percentage') {
                    Percentage (%)
                  } @else {
                    Discount value ($)
                  }
                </span>
                <input
                  type="number"
                  min="0"
                  [max]="store.discount().type === 'percentage' ? 100 : null"
                  step="0.01"
                  class="h-10 w-full rounded-md border border-border bg-card px-3 text-sm text-foreground"
                  [value]="store.discount().value"
                  (input)="onDiscountValueInput($event)"
                />
              </label>
            }
          </div>
        </div>

        <div class="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            class="rounded-md border border-border px-3 py-2 text-xs font-medium text-foreground  hover:bg-muted"
            (click)="store.clearCart()"
          >
            Clear cart
          </button>
          <button
            type="button"
            class="rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground  hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            [disabled]="!store.canCheckout()"
          >
            Checkout
          </button>
        </div>
      </section>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartPageComponent {
  readonly store = inject(CartStore);

  onQuantityInput(productId: string, event: Event): void {
    const inputElement = event.target as HTMLInputElement | null;
    this.store.updateQuantity(productId, parseNumber(inputElement?.value ?? null) ?? 0);
  }

  onDiscountTypeChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement | null;
    const nextType = parseDiscountType(selectElement?.value ?? 'none');
    const current = this.store.discount();

    switch (nextType) {
      case 'percentage':
        this.store.setDiscount({
          type: 'percentage',
          value: current.type === 'percentage' ? current.value : 0,
        });
        break;
      case 'fixed':
        this.store.setDiscount({
          type: 'fixed',
          value: current.type === 'fixed' ? current.value : 0,
        });
        break;

      default:
        this.store.setDiscount({ type: 'none', value: 0 });
    }
  }

  onDiscountValueInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement | null;
    const value = parseNumber(inputElement?.value ?? null) ?? 0;
    const current = this.store.discount();

    if (current.type === 'percentage' || current.type === 'fixed') {
      this.store.setDiscount({
        type: current.type,
        value,
      });
    }
  }
}
