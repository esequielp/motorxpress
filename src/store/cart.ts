import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id:          string;
  sku:         string;
  name:        string;
  price:       number;
  quantity:    number;
  image?:      string;
  maxStock:    number;
  is_offer?:   number;
  offer_price?: number;
}

interface CartStore {
  items:       CartItem[];
  isOpen:      boolean;
  setIsOpen:   (open: boolean) => void;
  addItem:     (item: Omit<CartItem, 'quantity'>) => void;
  removeItem:  (sku: string) => void;
  updateQty:   (sku: string, qty: number) => void;
  clearCart:   () => void;
  total:       () => number;
  itemCount:   () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      setIsOpen: (isOpen: boolean) => set({ isOpen }),
      addItem: (item) => set((state) => {
        const existing = state.items.find(i => i.sku === item.sku);
        if (existing) {
          return {
            items: state.items.map(i =>
              i.sku === item.sku
                ? { ...i, quantity: Math.min(i.quantity + 1, i.maxStock || 99) }
                : i
            ),
            isOpen: true
          };
        }
        return { items: [...state.items, { ...item, quantity: 1 }], isOpen: true };
      }),

      removeItem: (sku) => set((state) => ({
        items: state.items.filter(i => i.sku !== sku),
      })),

      updateQty: (sku, qty) => set((state) => ({
        items: qty <= 0
          ? state.items.filter(i => i.sku !== sku)
          : state.items.map(i =>
              i.sku === sku
                ? { ...i, quantity: Math.min(qty, i.maxStock || 99) }
                : i
            ),
      })),

      clearCart: () => set({ items: [] }),

      total: () => get().items.reduce(
        (acc, i) => acc + (i.is_offer === 1 && i.offer_price ? i.offer_price : i.price) * i.quantity, 0
      ),

      itemCount: () => get().items.reduce(
        (acc, i) => acc + i.quantity, 0
      ),
    }),
    { name: 'motorxpress-cart' }
  )
);
