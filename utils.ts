
import { Transaction, ExtractionResult, RawExtractionResponse } from './types';

/**
 * Converts ISO YYYY-MM-DD string to MM/DD format
 */
export const formatDisplayDate = (isoDate: string): string => {
  if (!isoDate) return "";
  const parts = isoDate.split('-');
  if (parts.length === 3) {
    return `${parts[1]}/${parts[2]}`;
  }
  return isoDate;
};

/**
 * Processes raw transactions:
 * 1. Filters out specific excluded phrases
 * 2. Sorts both lists by date
 */
export const processTransactions = (rawData: RawExtractionResponse): ExtractionResult => {
  const validTransactions: Transaction[] = [];
  const excludedTransactions: Transaction[] = [];

  // Define phrases to filter out (case-insensitive)
  const excludedPhrases = [
    "payment thank you - web", 
    "bp fuel", 
    "kroger fuel",
    "total wine"
  ];

  if (rawData.transactions) {
    rawData.transactions.forEach(t => {
      const descriptionLower = t.description.toLowerCase();
      
      // Check if description includes any excluded phrase
      const matchesPhrase = excludedPhrases.some(phrase => descriptionLower.includes(phrase));
      
      // Check if description strictly starts with "bp#"
      const startsWithBpHash = descriptionLower.startsWith("bp#");

      if (matchesPhrase || startsWithBpHash) {
        excludedTransactions.push(t);
      } else {
        validTransactions.push(t);
      }
    });

    // Sort by Date (YYYY-MM-DD string sort works chronologically)
    const dateSort = (a: Transaction, b: Transaction) => a.date.localeCompare(b.date);
    
    validTransactions.sort(dateSort);
    excludedTransactions.sort(dateSort);
  }

  return {
    transactions: validTransactions,
    excludedTransactions: excludedTransactions,
    currency: rawData.currency,
    bankName: rawData.bankName
  };
};
