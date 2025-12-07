
import React from 'react';
import { Transaction } from '../types';
import { formatDisplayDate } from '../utils';

interface TransactionTableProps {
  transactions: Transaction[];
}

export const TransactionTable: React.FC<TransactionTableProps> = ({ transactions }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto max-h-[500px]">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-3 font-medium text-slate-500">Date</th>
              <th className="px-6 py-3 font-medium text-slate-500">Description</th>
              <th className="px-6 py-3 font-medium text-slate-500">Category</th>
              <th className="px-6 py-3 font-medium text-slate-500 text-right">Amount</th>
              <th className="px-6 py-3 font-medium text-slate-500 text-center">Type</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transactions.map((t, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-3 text-slate-600 whitespace-nowrap">{formatDisplayDate(t.date)}</td>
                <td className="px-6 py-3 text-slate-900 font-medium">{t.description}</td>
                <td className="px-6 py-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                    {t.category || 'Uncategorized'}
                  </span>
                </td>
                <td className={`px-6 py-3 text-right font-mono font-medium ${t.type === 'INFLOW' ? 'text-green-600' : 'text-slate-900'}`}>
                  {t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-3 text-center">
                  <span className={`
                    inline-flex items-center justify-center w-6 h-6 rounded-full 
                    ${t.type === 'INFLOW' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}
                  `}>
                    {t.type === 'INFLOW' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M10 17a.75.75 0 0 1-.75-.75V5.612L5.29 9.77a.75.75 0 0 1-1.08-1.04l5.25-5.5a.75.75 0 0 1 1.08 0l5.25 5.5a.75.75 0 1 1-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0 1 10 17Z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M10 3a.75.75 0 0 1 .75.75v10.638l3.96-4.158a.75.75 0 1 1 1.08 1.04l-5.25 5.5a.75.75 0 0 1-1.08 0l-5.25-5.5a.75.75 0 1 1 1.08-1.04l3.96 4.158V3.75A.75.75 0 0 1 10 3Z" clipRule="evenodd" />
                      </svg>
                    )}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
