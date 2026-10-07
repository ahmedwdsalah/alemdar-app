import React, { createContext, useCallback, useContext, useState } from 'react';

export type WishlistItem = {
  id: string;
  name: string;
  price: string;
  dec: string;
  stock: string;
  low: boolean;
  sectionId: string;
  sectionTitle: string;
  accentColor: string;
};

type WishlistContextType = {
  items: WishlistItem[];
  toggleWishlist: (item: WishlistItem) => void;
  isWishlisted: (id: string) => boolean;
  totalItems: number;
};

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);

  const toggleWishlist = useCallback((item: WishlistItem) => {
    setItems(prev => {
      const exists = prev.some(i => i.id === item.id);
      return exists ? prev.filter(i => i.id !== item.id) : [...prev, item];
    });
  }, []);

  const isWishlisted = useCallback(
    (id: string) => items.some(i => i.id === id),
    [items]
  );

  return (
    <WishlistContext.Provider value={{ items, toggleWishlist, isWishlisted, totalItems: items.length }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be inside WishlistProvider');
  return ctx;
}
