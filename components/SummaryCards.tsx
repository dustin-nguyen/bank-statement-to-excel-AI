
import React from 'react';
import { ExtractionResult } from '../types';

interface SummaryCardsProps {
  data: ExtractionResult;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ data }) => {
  const totalInflow = data.transactions
    .filter(t => t.type === 'INFLOW')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalOutflow = data.transactions
    .filter(t => t.type === 'OUTFLOW')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const netFlow = totalInflow - totalOutflow;
  const currency = data.currency || '$';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <p className="text-sm font-medium text-slate-500 uppercase">Total Inflow</p>
        <p className="text-2xl font-bold text-green-600 mt-1">
          +{currency}{totalInflow.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </p>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <p className="text-sm font-medium text-slate-500 uppercase">Total Outflow</p>
        <p className="text-2xl font-bold text-red-600 mt-1">
          -{currency}{totalOutflow.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </p>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <p className="text-sm font-medium text-slate-500 uppercase">Net Flow</p>
        <p className={`text-2xl font-bold mt-1 ${netFlow >= 0 ? 'text-slate-900' : 'text-red-600'}`}>
          {currency}{netFlow.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </p>
      </div>
    </div>
  );
};
