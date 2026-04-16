/**
 * WishlistContext - Global wishlist state
 */
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { wishlistAPI } from '../services/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [wishlistIds, setWishlistIds] = useState(new Set());

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) { setWishlist([]); setWishlistIds(new Set()); return; }
    try {
      const { data } = await wishlistAPI.get();
      setWishlist(data);
      setWishlistIds(new Set(data.map(item => item.product_id)));
    } catch { setWishlist([]); }
  }, [isAuthenticated]);

  useEffect(() => { fetchWishlist(); }, [fetchWishlist]);

  const toggleWishlist = useCallback(async (productId) => {
    if (wishlistIds.has(productId)) {
      await wishlistAPI.remove(productId);
    } else {
      await wishlistAPI.add(productId);
    }
    await fetchWishlist();
  }, [wishlistIds, fetchWishlist]);

  const isInWishlist = useCallback((productId) => wishlistIds.has(productId), [wishlistIds]);

  return (
    <WishlistContext.Provider value={{ wishlist, wishlistIds, toggleWishlist, isInWishlist, fetchWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
};
