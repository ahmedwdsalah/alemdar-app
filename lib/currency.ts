const NORTH_CYPRUS_TRY_MARGIN_MULTIPLIER = 1.046206;

export type ExchangeRates = {
  base: string;
  date: string | null;
  rates: {
    USD: number;
    TRY: number;
    EUR: number;
  };
  fallback?: boolean;
};

export async function fetchExchangeRates(): Promise<ExchangeRates> {
  try {
    const response = await fetch(
      'https://api.frankfurter.dev/v1/latest?base=USD&symbols=TRY,EUR'
    );

    if (!response.ok) {
      throw new Error(`Rate fetch failed: ${response.status}`);
    }

    const data = await response.json();
    const tryRate = data.rates?.TRY;
    const eurRate = data.rates?.EUR;

    if (!tryRate || !eurRate || tryRate <= 0 || eurRate <= 0) {
      throw new Error('Exchange rate response is incomplete');
    }

    return {
      base: 'USD',
      date: data.date || null,
      rates: {
        USD: 1,
        TRY: tryRate * NORTH_CYPRUS_TRY_MARGIN_MULTIPLIER,
        EUR: eurRate,
      },
    };
  } catch (error) {
    console.error('[currency-rates] failed:', error);
    return {
      base: 'USD',
      date: null,
      rates: {
        USD: 1,
        TRY: 1,
        EUR: 1,
      },
      fallback: true,
    };
  }
}