
export type TransactionType = 'INFLOW' | 'OUTFLOW';

export interface Transaction {
  date: string; // YYYY-MM-DD
  description: string;
  amount: number;
  type: TransactionType;
  category?: string;
}

export interface ExtractionResult {
  transactions: Transaction[];
  excludedTransactions: Transaction[];
  currency?: string;
  bankName?: string;
}

export interface RawExtractionResponse {
  transactions: Transaction[];
  currency?: string;
  bankName?: string;
}
