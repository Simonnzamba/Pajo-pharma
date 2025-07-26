import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Taux de change fixe : 1 USD = 28 000 CDF
export const USD_TO_CDF_RATE = 28000;

export function formatCurrency(amount: number, currency: 'CDF' | 'USD' = 'CDF', showCurrency = true) {
  const formattedAmount = new Intl.NumberFormat('fr-CD', {
    minimumFractionDigits: 0, // Pas de décimales pour les CDF
    maximumFractionDigits: 0,
  }).format(amount);

  if (currency === 'CDF') {
    return `${formattedAmount}${showCurrency ? ' CDF' : ''}`;
  } else if (currency === 'USD') {
    // Pour l'affichage en USD, on peut garder 2 décimales
    const usdFormattedAmount = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
    return `${usdFormattedAmount}${showCurrency ? ' USD' : ''}`;
  }
  return formattedAmount;
}

export function convertUsdToCdf(usdAmount: number): number {
  return usdAmount * USD_TO_CDF_RATE;
}

export function convertCdfToUsd(cdfAmount: number): number {
  return cdfAmount / USD_TO_CDF_RATE;
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}