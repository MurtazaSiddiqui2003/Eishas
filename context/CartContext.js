"use client";

// One cart for the whole site. Each item remembers which store it came
// from (item.store) so the cart page can group things and checkout can
// show "Eisha's Collection", "Eisha's Beauty" etc. as sub-sections.
// Items are keyed by product + size + color together, since the same
// product in two different colors is a different line item.

import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

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

  function addItem(product, quantity = 1, options = {}) {
    const { size = null, color = null } = options;

    setItems((prev) => {
      const existing = prev.find(
        (i) => i.productId === product._id && i.size === size && i.color === color
      );
      if (existing) {
        return prev.map((i) =>
          i.productId === product._id && i.size === size && i.color === color
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
          color,
          quantity,
        },
      ];
    });

    // Sliding cart drawer opens automatically whenever something's added.
    setIsOpen(true);
  }

  function removeItem(productId, size = null, color = null) {
    setItems((prev) =>
      prev.filter((i) => !(i.productId === productId && i.size === size && i.color === color))
    );
  }

  function updateQuantity(productId, size, color, quantity) {
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId && i.size === size && i.color === color
          ? { ...i, quantity }
          : i
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
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        total,
        count,
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        toggleCart: () => setIsOpen((v) => !v),
      }}
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
