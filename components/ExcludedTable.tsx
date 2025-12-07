
import React from 'react';
import { Transaction } from '../types';
import { formatDisplayDate } from '../utils';

interface ExcludedTableProps {
  transactions: Transaction[];
}

export const ExcludedTable: React.FC<ExcludedTableProps> = ({ transactions }) => {
  if (!transactions || transactions.length === 0) return null;

  return (
    <div className="space-y-4 pt-4">
      <div className="flex items-center gap-2 text-amber-600">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
          <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
        </svg>
        <h3 className="text-lg font-semibold">Filtered Transactions (Excluded from Excel)</h3>
      </div>
      <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden opacity-75">
        <table className="w-full text-left text-sm text-slate-500">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-6 py-3 font-medium">Date</th>
              <th className="px-6 py-3 font-medium">Description</th>
              <th className="px-6 py-3 font-medium text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {transactions.map((t, idx) => (
              <tr key={idx}>
                <td className="px-6 py-3 whitespace-nowrap">{formatDisplayDate(t.date)}</td>
                <td className="px-6 py-3">{t.description}</td>
                <td className="px-6 py-3 text-right font-mono">
                  {t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
