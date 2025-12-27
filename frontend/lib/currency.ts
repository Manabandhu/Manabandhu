import { useAuthStore } from "@/store/auth.store";
import currencySymbolMap from "currency-symbol-map";
import * as currencyCodes from "currency-codes";

/**
 * Get currency symbol for a currency code using currency-symbol-map library
 */
export function getCurrencySymbol(currencyCode?: string): string {
  const code = currencyCode || "USD";
  return currencySymbolMap(code) || "$";
}

/**
 * Get currency name for a currency code
 * Uses currency-codes library for reliable currency names
 */
export function getCurrencyName(currencyCode?: string): string {
  const code = currencyCode || "USD";
  
  try {
    // Try using Intl.DisplayNames first (if available)
    if (typeof Intl !== "undefined" && Intl.DisplayNames) {
      const displayNames = new Intl.DisplayNames(["en"], { type: "currency" });
      const name = displayNames.of(code);
      if (name && name !== code) {
        return name;
      }
    }
  } catch (error) {
    // Fallback to currency-codes library
  }
  
  // Use currency-codes library as primary/fallback source
  try {
    const currency = currencyCodes.code(code);
    if (currency && currency.currency) {
      return currency.currency;
    }
  } catch (error) {
    // If currency-codes doesn't have it, return the code
  }
  
  // Final fallback: return the currency code
  return code;
}

/**
 * Format a number as currency using Intl.NumberFormat API
 */
export function formatCurrency(
  amount: number | string,
  currencyCode?: string
): string {
  const code = currencyCode || "USD";
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return formatCurrency(0, code);
  }
  
  try {
    // Use Intl.NumberFormat for proper currency formatting (built-in, no dependency)
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numAmount);
  } catch (error) {
    // Fallback if Intl.NumberFormat is not available
    const symbol = getCurrencySymbol(code);
    const formatted = numAmount.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return `${symbol}${formatted}`;
  }
}

/**
 * Get all available currencies
 * Returns a curated list of commonly used currencies
 * Uses currency-codes library to get all available currencies
 */
export function getAvailableCurrencies(): Array<{ code: string; name: string; symbol: string }> {
  // Common currencies list (most frequently used)
  const commonCurrencies = [
    "USD", "EUR", "GBP", "INR", "JPY", "CAD", "AUD", "CHF", "CNY", "SGD",
    "NZD", "HKD", "SEK", "NOK", "DKK", "PLN", "MXN", "BRL", "ZAR", "KRW"
  ];
  
  return commonCurrencies.map((code) => ({
    code,
    name: getCurrencyName(code),
    symbol: getCurrencySymbol(code),
  }));
}

/**
 * Get all currencies from currency-codes library (extended list)
 * Use this if you need access to all available currencies
 */
export function getAllCurrencies(): Array<{ code: string; name: string; symbol: string }> {
  try {
    const allCurrencies = currencyCodes.codes();
    return allCurrencies
      .map((code: string) => ({
        code,
        name: getCurrencyName(code),
        symbol: getCurrencySymbol(code),
      }))
      .filter((curr: { code: string; name: string; symbol: string }) => 
        curr.symbol && curr.name !== curr.code // Filter out invalid entries
      );
  } catch (error) {
    // Fallback to common currencies if currency-codes fails
    return getAvailableCurrencies();
  }
}

/**
 * Hook to get current user's currency
 */
export function useCurrency() {
  const user = useAuthStore((state) => state.user);
  const currency = user?.currency || "USD";
  
  return {
    currency,
    symbol: getCurrencySymbol(currency),
    name: getCurrencyName(currency),
    format: (amount: number | string) => formatCurrency(amount, currency),
  };
}

