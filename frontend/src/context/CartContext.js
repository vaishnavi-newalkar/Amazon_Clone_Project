/**
 * CartContext - Global cart state management
 * Syncs with backend, provides cart data and actions
 */
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

const EMPTY_CART = { items: [], item_count: 0, subtotal: 0, shipping_cost: 0, total: 0 };

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart]       = useState(EMPTY_CART);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) { setCart(EMPTY_CART); return; }
    setLoading(true);
    try {
      const { data } = await cartAPI.get();
      setCart(data);
    } catch { setCart(EMPTY_CART); }
    finally { setLoading(false); }
  }, [isAuthenticated]);

  // Fetch cart whenever auth status changes
  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = useCallback(async (productId, quantity = 1) => {
    const { data } = await cartAPI.add({ product_id: productId, quantity });
    await fetchCart();
    return data;
  }, [fetchCart]);

  const updateItem = useCallback(async (itemId, quantity) => {
    await cartAPI.update(itemId, { quantity });
    await fetchCart();
  }, [fetchCart]);

  const removeItem = useCallback(async (itemId) => {
    await cartAPI.remove(itemId);
    await fetchCart();
  }, [fetchCart]);

  const clearCart = useCallback(async () => {
    await cartAPI.clear();
    setCart(EMPTY_CART);
  }, []);

  return (
    <CartContext.Provider value={{ cart, loading, fetchCart, addToCart, updateItem, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
