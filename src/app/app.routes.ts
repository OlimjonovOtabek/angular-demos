import { Routes } from '@angular/router';
import { CartPageComponent } from './features/cart/cart-page.component';
import { TodoPageComponent } from './features/todo/todo-page.component';

export const routes: Routes = [
  {
    path: 'cart',
    component: CartPageComponent,
  },
  {
    path: 'todo',
    component: TodoPageComponent,
  },
];
