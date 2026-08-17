"use client";

// One cart for the whole site. Each item remembers which store it came
// from (item.store) so the cart page can group things and checkout can
// show "Eisha's Collection", "Eisha's Beauty" etc. as sub-sections.

import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);

  // Load saved cart on first render
  useEffect(() => {
    const saved = localStorage.getItem("eishas_cart");
    if (saved) {
      setItems(JSON.parse(saved));
    }
    setLoaded(true);
  }, []);

  // Save cart whenever it changes (after initial load)
  useEffect(() => {
    if (loaded) {
      localStorage.setItem("eishas_cart", JSON.stringify(items));
    }
  }, [items, loaded]);

  function addItem(product, quantity = 1, size = null) {
    setItems((prev) => {
      const existing = prev.find(
        (i) => i.productId === product._id && i.size === size
      );
      if (existing) {
        return prev.map((i) =>
          i.productId === product._id && i.size === size
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [
        ...prev,
        {
          productId: product._id,
          store: product.store,
          name: product.name,
          price: product.price,
          image: product.images?.[0],
          size,
          quantity,
        },
      ];
    });
  }

  function removeItem(productId, size = null) {
    setItems((prev) =>
      prev.filter((i) => !(i.productId === productId && i.size === size))
    );
  }

  function updateQuantity(productId, size, quantity) {
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId && i.size === size ? { ...i, quantity } : i
      )
    );
  }

  function clearCart() {
    setItems([]);
  }

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, total, count }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside a CartProvider");
  return ctx;
}
