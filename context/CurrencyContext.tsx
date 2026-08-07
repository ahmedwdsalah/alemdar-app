import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

export type Currency = {
  code: string;
  symbol: string;
  rate: number;
  label: string;
};

export const currencies: Currency[] = [
  { code: 'TRY', symbol: '₺', rate: 1, label: 'Turkish Lira' },
  { code: 'USD', symbol: '$', rate: 0.03, label: 'US Dollar' },
  { code: 'EUR', symbol: '€', rate: 0.028, label: 'Euro' },
  { code: 'GBP', symbol: '£', rate: 0.024, label: 'British Pound' },
  { code: 'AED', symbol: 'د.إ', rate: 0.11, label: 'UAE Dirham' },
];

type CurrencyContextType = {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  convertPrice: (priceInTRY: number) => string;
  getSymbol: () => string;
};

const CurrencyContext = createContext<CurrencyContextType | null>(null);

const STORAGE_KEY = '@currency_preference';

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<Currency>(currencies[0]);

  useEffect(() => {
    const loadCurrency = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          const found = currencies.find(c => c.code === parsed.code);
          if (found) setCurrency(found);
        }
      } catch (error) {
        console.log('Error loading currency:', error);
      }
    };
    loadCurrency();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(currency));
  }, [currency]);

  const convertPrice = useCallback((priceInTRY: number): string => {
    const converted = priceInTRY * currency.rate;
    return `${currency.symbol} ${converted.toFixed(2)}`;
  }, [currency]);

  const getSymbol = useCallback(() => currency.symbol, [currency]);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, convertPrice, getSymbol }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used inside CurrencyProvider');
  return ctx;
}