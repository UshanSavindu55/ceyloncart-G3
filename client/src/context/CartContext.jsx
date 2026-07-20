import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);
const CART_STORAGE_KEY = 'ceyloncart-cart-items';
const LAST_ORDER_STORAGE_KEY = 'ceyloncart-last-order';

function readStoredValue(key, fallback) {
  try {
    const storedValue = window.localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : fallback;
  } catch {
    return fallback;
  }
}

function normalizeQuantity(quantity) {
  const parsedQuantity = Number(quantity);
  if (!Number.isFinite(parsedQuantity)) {
    return 1;
  }

  return Math.max(1, Math.floor(parsedQuantity));
}

function calculateTotals(items) {
  return items.reduce(
    (accumulator, item) => {
      const lineTotal = item.price * item.quantity;
      accumulator.total += lineTotal;
      accumulator.itemCount += item.quantity;
      return accumulator;
    },
    { total: 0, itemCount: 0 },
  );
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => readStoredValue(CART_STORAGE_KEY, []));
  const [lastOrder, setLastOrderState] = useState(() => readStoredValue(LAST_ORDER_STORAGE_KEY, null));

  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    window.localStorage.setItem(LAST_ORDER_STORAGE_KEY, JSON.stringify(lastOrder));
  }, [lastOrder]);

  const addToCart = (product, quantity = 1) => {
    if (!product) {
      return;
    }

    const quantityToAdd = normalizeQuantity(quantity);

    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === product.id);

      if (existingItem) {
        return currentItems.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantityToAdd } : item,
        );
      }

      return [
        ...currentItems,
        {
          id: product.id,
          name: product.name,
          category: product.category,
          price: product.price,
          image: product.image,
          shortDescription: product.shortDescription,
          quantity: quantityToAdd,
        },
      ];
    });
  };

  const removeFromCart = (id) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
  };

  const updateQuantity = (id, quantity) => {
    const nextQuantity = normalizeQuantity(quantity);

    setItems((currentItems) =>
      currentItems.map((item) => (item.id === id ? { ...item, quantity: nextQuantity } : item)),
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const setLastOrder = (order) => {
    setLastOrderState(order);
  };

  const { total, itemCount } = useMemo(() => calculateTotals(items), [items]);

  const value = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    total,
    itemCount,
    lastOrder,
    setLastOrder,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }

  return context;
}