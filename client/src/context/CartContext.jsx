import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

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

function isValidCartItem(item) {
  if (!item || typeof item !== 'object' || Array.isArray(item)) {
    return false;
  }

  const id = typeof item.id === 'string' || typeof item.id === 'number' ? String(item.id).trim() : '';
  const name = typeof item.name === 'string' ? item.name.trim() : '';
  const price = Number(item.price);
  const quantity = normalizeQuantity(item.quantity);

  return Boolean(id) && Boolean(name) && Number.isFinite(price) && price >= 0 && quantity >= 1;
}

function sanitizeCartItem(item) {
  if (!isValidCartItem(item)) {
    return null;
  }

  const normalizedId = typeof item.id === 'string' || typeof item.id === 'number' ? String(item.id).trim() : '';
  const normalizedName = typeof item.name === 'string' ? item.name.trim() : '';
  const normalizedPrice = Number(item.price);
  const normalizedQuantity = normalizeQuantity(item.quantity);
  const category = typeof item.category === 'string' ? item.category.trim() : '';
  const image = typeof item.image === 'string' ? item.image : '';
  const shortDescription = typeof item.shortDescription === 'string' ? item.shortDescription.trim() : '';

  return {
    id: normalizedId,
    name: normalizedName,
    category,
    price: normalizedPrice,
    image,
    shortDescription,
    quantity: normalizedQuantity,
  };
}

function readStoredCart() {
  try {
    const storedValue = window.localStorage.getItem(CART_STORAGE_KEY);
    if (storedValue === null) {
      return [];
    }

    const parsedValue = JSON.parse(storedValue);
    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue.map(sanitizeCartItem).filter(Boolean);
  } catch {
    return [];
  }
}

function readStoredOrder() {
  try {
    const storedValue = window.localStorage.getItem(LAST_ORDER_STORAGE_KEY);
    if (storedValue === null) {
      return null;
    }

    const parsedValue = JSON.parse(storedValue);
    return parsedValue && typeof parsedValue === 'object' ? parsedValue : null;
  } catch {
    return null;
  }
}

function normalizeProduct(product) {
  if (!product || typeof product !== 'object' || Array.isArray(product)) {
    return null;
  }

  const id = typeof product.id === 'string' || typeof product.id === 'number' ? String(product.id).trim() : '';
  const name = typeof product.name === 'string' ? product.name.trim() : '';
  const price = Number(product.price);

  if (!id || !name || !Number.isFinite(price) || price < 0) {
    return null;
  }

  return {
    id,
    name,
    category: typeof product.category === 'string' ? product.category.trim() : '',
    price,
    image: typeof product.image === 'string' ? product.image : '',
    shortDescription: typeof product.shortDescription === 'string' ? product.shortDescription.trim() : '',
  };
}

function calculateTotals(items) {
  return (Array.isArray(items) ? items : []).reduce(
    (accumulator, item) => {
      const nextPrice = Number(item.price);
      const nextQuantity = normalizeQuantity(item.quantity);

      if (!Number.isFinite(nextPrice) || nextPrice < 0) {
        return accumulator;
      }

      accumulator.total += nextPrice * nextQuantity;
      accumulator.itemCount += nextQuantity;
      return accumulator;
    },
    { total: 0, itemCount: 0 },
  );
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => readStoredCart());
  const [lastOrder, setLastOrderState] = useState(() => readStoredOrder());

  useEffect(() => {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage write issues.
    }
  }, [items]);

  useEffect(() => {
    try {
      window.localStorage.setItem(LAST_ORDER_STORAGE_KEY, JSON.stringify(lastOrder));
    } catch {
      // Ignore storage write issues.
    }
  }, [lastOrder]);

  const addToCart = useCallback((product, quantity = 1) => {
    const normalizedProduct = normalizeProduct(product);
    if (!normalizedProduct) {
      return;
    }

    const quantityToAdd = normalizeQuantity(quantity);

    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === normalizedProduct.id);

      if (existingItem) {
        return currentItems.map((item) =>
          item.id === normalizedProduct.id ? { ...item, quantity: item.quantity + quantityToAdd } : item,
        );
      }

      return [
        ...currentItems,
        {
          id: normalizedProduct.id,
          name: normalizedProduct.name,
          category: normalizedProduct.category,
          price: normalizedProduct.price,
          image: normalizedProduct.image,
          shortDescription: normalizedProduct.shortDescription,
          quantity: quantityToAdd,
        },
      ];
    });
  }, []);

  const removeFromCart = useCallback((id) => {
    const normalizedId = typeof id === 'string' || typeof id === 'number' ? String(id).trim() : '';
    if (!normalizedId) {
      return;
    }

    setItems((currentItems) => {
      const hasMatchingItem = currentItems.some((item) => item.id === normalizedId);
      if (!hasMatchingItem) {
        return currentItems;
      }

      return currentItems.filter((item) => item.id !== normalizedId);
    });
  }, []);

  const updateQuantity = useCallback((id, quantity) => {
    const normalizedId = typeof id === 'string' || typeof id === 'number' ? String(id).trim() : '';
    if (!normalizedId) {
      return;
    }

    const nextQuantity = normalizeQuantity(quantity);

    setItems((currentItems) => {
      const hasMatchingItem = currentItems.some((item) => item.id === normalizedId);
      if (!hasMatchingItem) {
        return currentItems;
      }

      return currentItems.map((item) => (item.id === normalizedId ? { ...item, quantity: nextQuantity } : item));
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const setLastOrder = useCallback((order) => {
    setLastOrderState(order);
  }, []);

  const { total, itemCount } = useMemo(() => calculateTotals(items), [items]);

  const value = useMemo(
    () => ({
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      total,
      itemCount,
      lastOrder,
      setLastOrder,
    }),
    [addToCart, clearCart, itemCount, items, lastOrder, removeFromCart, setLastOrder, total, updateQuantity],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }

  return context;
}