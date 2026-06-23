import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, LocalCartItem } from '../types';
import api from '../services/api';
import { useAuth } from './AuthContext';

interface CartContextType {
  items: CartItem[];
  localItems: LocalCartItem[];
  loading: boolean;
  addToCart: (productId: number, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: number, productId: number) => Promise<void>;
  updateQuantity: (cartItemId: number, productId: number, quantity: number) => Promise<void>;
  clearCart: () => void;
  syncCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [localItems, setLocalItems] = useState<LocalCartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(false);

  // Sync to local storage whenever localItems change
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(localItems));
  }, [localItems]);

  // Fetch cart from DB when user logs in
  useEffect(() => {
    if (user && user.role === 'user' && token) {
      fetchCart();
    } else {
      setItems([]);
    }
  }, [user, token]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/cart');
      if (data.success) setItems(data.data);
    } catch (error) {
      console.error('Failed to fetch cart', error);
    } finally {
      setLoading(false);
    }
  };

  const syncCart = async () => {
    if (localItems.length > 0) {
      try {
        const { data } = await api.post('/cart/sync', { items: localItems });
        if (data.success) {
          setItems(data.data);
          setLocalItems([]);
        }
      } catch (error) {
        console.error('Failed to sync cart', error);
      }
    }
  };

  const addToCart = async (productId: number, quantity: number) => {
    if (user && token) {
      try {
        await api.post('/cart', { productId, quantity });
        await fetchCart();
      } catch (error: any) {
        throw error.response?.data?.message || 'Failed to add to cart';
      }
    } else {
      setLocalItems(prev => {
        const existing = prev.find(item => item.productId === productId);
        if (existing) {
          return prev.map(item =>
            item.productId === productId
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [...prev, { productId, quantity }];
      });
    }
  };

  const updateQuantity = async (cartItemId: number, productId: number, quantity: number) => {
    if (user && token) {
      try {
        await api.put(`/cart/${cartItemId}`, { quantity });
        await fetchCart();
      } catch (error: any) {
        throw error.response?.data?.message || 'Failed to update quantity';
      }
    } else {
      setLocalItems(prev =>
        prev.map(item =>
          item.productId === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const removeFromCart = async (cartItemId: number, productId: number) => {
    if (user && token) {
      try {
        await api.delete(`/cart/${cartItemId}`);
        setItems(prev => prev.filter(item => item.id !== cartItemId));
      } catch (error) {
        console.error('Failed to remove item', error);
      }
    } else {
      setLocalItems(prev => prev.filter(item => item.productId !== productId));
    }
  };

  const clearCart = () => {
    if (user && token) {
      // In a real app we might have a backend clear endpoint
      // For now, checkout clears it
      setItems([]);
    } else {
      setLocalItems([]);
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        localItems,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        syncCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
