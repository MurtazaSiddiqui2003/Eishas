"use client";

import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);

function isValidCartItem(item) {
  return (
    item &&
    typeof item.productId === "string" &&
    typeof item.name === "string" &&
    typeof item.price === "number" &&
    Number.isFinite(item.price) &&
    typeof item.quantity === "number" &&
    Number.isInteger(item.quantity) &&
    item.quantity > 0
  );
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("eishas_cart");
      if (saved) {
        const parsed = JSON.parse(saved);
        setItems(Array.isArray(parsed) ? parsed.filter(isValidCartItem) : []);
      }
    } catch {
      localStorage.removeItem("eishas_cart");
      setItems([]);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem("eishas_cart", JSON.stringify(items));
    }
  }, [items, loaded]);

  function addItem(product, quantity = 1, options = {}) {
    const { size = null, color = null } = options;
    const safeQuantity = Number.isInteger(quantity) && quantity > 0 ? quantity : 1;

    setItems((prev) => {
      const existing = prev.find(
        (i) => i.productId === product._id && i.size === size && i.color === color
      );
      if (existing) {
        return prev.map((i) =>
          i.productId === product._id && i.size === size && i.color === color
            ? { ...i, quantity: i.quantity + safeQuantity }
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
          quantity: safeQuantity,
        },
      ];
    });

    setIsOpen(true);
  }

  function removeItem(productId, size = null, color = null) {
    setItems((prev) =>
      prev.filter((i) => !(i.productId === productId && i.size === size && i.color === color))
    );
  }

  function updateQuantity(productId, size, color, quantity) {
    const safeQuantity = Number.isInteger(quantity) ? quantity : 1;
    if (safeQuantity <= 0) {
      removeItem(productId, size, color);
      return;
    }

    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId && i.size === size && i.color === color
          ? { ...i, quantity: safeQuantity }
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
