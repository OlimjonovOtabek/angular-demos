export type ItemCategory = 'electronics' | 'books' | 'sports' | 'home';

export interface Item {
  id: string;
  title: string;
  category: ItemCategory;
  price: number;
}
