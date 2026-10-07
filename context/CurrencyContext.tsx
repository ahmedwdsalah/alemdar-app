import { fetchExchangeRates } from '@/lib/currency';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

export type Currency = {
  code: string;
  symbol: string;
  rate: number;
  label: string;
};

export const currencies = [
  { code: 'TRY', symbol: '₺', label: 'Turkish Lira' },
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
];

type CurrencyContextType = {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  convertPrice: (priceInUSD: number) => string;
  getSymbol: () => string;
  isLoading: boolean;
  refreshRates: () => Promise<void>;
  lastUpdated: string | null;
  isUsingFallback: boolean;
};

const CurrencyContext = createContext<CurrencyContextType | null>(null);
const STORAGE_KEY = '@currency_preference';
const RATES_STORAGE_KEY = '@currency_rates';

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<Currency>({ code: 'TRY', symbol: '₺', rate: 1, label: 'Turkish Lira' });
  const [rates, setRates] = useState<Record<string, number>>({ USD: 1, TRY: 1, EUR: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  const refreshRates = async () => {
    try {
      setIsLoading(true);
      const exchangeRates = await fetchExchangeRates();

      const newRates: Record<string, number> = {
        USD: 1,
        TRY: exchangeRates.rates.TRY,
        EUR: exchangeRates.rates.EUR,
      };

      setRates(newRates);
      setIsUsingFallback(!!exchangeRates.fallback);

      const now = new Date();
      const dateStr = now.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      setLastUpdated(exchangeRates.fallback ? 'Cached (offline)' : dateStr);

      await AsyncStorage.setItem(RATES_STORAGE_KEY, JSON.stringify({
        rates: newRates,
        timestamp: now.getTime(),
        date: dateStr,
        fallback: exchangeRates.fallback || false,
      }));
    } catch (error) {
      console.error('[currency-rates] refresh failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadRatesAndCurrency = async () => {
      setIsLoading(true);

      try {
        const cached = await AsyncStorage.getItem(RATES_STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          setRates(parsed.rates);
          setLastUpdated(parsed.date || 'Cached rates');
          setIsUsingFallback(parsed.fallback || true);
        }
      } catch (error) {
        console.error('Error loading cached rates:', error);
      }

      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          const found = currencies.find(c => c.code === parsed.code);
          if (found) {
            const rate = rates[found.code] || 1;
            setCurrency({ ...found, rate });
          }
        }
      } catch (error) {
        console.error('Error loading currency:', error);
      }

      // ⭐ Try to refresh rates, but don't block UI if it fails
      await refreshRates();
      setIsLoading(false);
    };

    loadRatesAndCurrency();
  }, []);

  useEffect(() => {
    const rate = rates[currency.code] || 1;
    setCurrency(prev => ({ ...prev, rate }));
  }, [rates, currency.code]);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(currency));
  }, [currency]);

  const convertPrice = useCallback((priceInUSD: number): string => {
    const converted = priceInUSD * currency.rate;
    return `${currency.symbol} ${converted.toFixed(2)}`;
  }, [currency]);

  const getSymbol = useCallback(() => currency.symbol, [currency]);

  const setCurrencyWithRate = useCallback((newCurrency: Currency) => {
    const rate = rates[newCurrency.code] || 1;
    setCurrency({ ...newCurrency, rate });
  }, [rates]);

  return (
    <CurrencyContext.Provider value={{
      currency,
      setCurrency: setCurrencyWithRate,
      convertPrice,
      getSymbol,
      isLoading,
      refreshRates,
      lastUpdated,
      isUsingFallback,
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used inside CurrencyProvider');
  return ctx;
}