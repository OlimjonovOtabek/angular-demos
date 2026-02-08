import { Routes } from '@angular/router';
import { CartPageComponent } from './features/cart/cart-page.component';
import { SearchFilterPageComponent } from './features/search-filter/search-filter.page.component';
import { TodoPageComponent } from './features/todo/todo-page.component';

export const routes: Routes = [
  {
    path: 'cart',
    component: CartPageComponent,
  },
  {
    path: 'search-filter',
    component: SearchFilterPageComponent,
  },
  {
    path: 'todo',
    component: TodoPageComponent,
  },
];
