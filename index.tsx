
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ExtractionResult, RawExtractionResponse } from './types';
import { analyzeDocument } from './api';
import { processTransactions } from './utils';
import { downloadExcel } from './excel';
import { FileUploader } from './components/FileUploader';
import { SummaryCards } from './components/SummaryCards';
import { TransactionTable } from './components/TransactionTable';
import { ExcludedTable } from './components/ExcludedTable';

const App = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleProcessDocument = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    setError(null);

    try {
      // 1. Process all files in parallel
      const promises = files.map(file => analyzeDocument(file));
      const results = await Promise.all(promises);
      
      // 2. Aggregate data from all results
      const allTransactions = results.flatMap(r => r.transactions || []);
      
      if (allTransactions.length === 0) {
        throw new Error("No transactions found in any of the uploaded files.");
      }

      // Use the first result's metadata as defaults
      const combinedRawData: RawExtractionResponse = {
        transactions: allTransactions,
        currency: results.find(r => r.currency)?.currency || '$',
        bankName: results.find(r => r.bankName)?.bankName || 'Multiple Statements'
      };

      // 3. Process data (filter, sort combined list)
      const processedData = processTransactions(combinedRawData);
      
      setResult(processedData);
    } catch (err) {
      console.error(err);
      setError("Failed to process documents. Please ensure they are valid PDF bank statements.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadExcel = () => {
    if (result) {
      downloadExcel(result.transactions);
    }
  };

  const resetApp = () => {
    setResult(null);
    setFiles([]);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Statement to Excel</h1>
          <p className="text-slate-500">Upload one or multiple PDF bank statements and merge them into a clean Excel sheet.</p>
        </div>

        {/* Upload Area */}
        {!result && (
          <FileUploader 
            files={files}
            onFilesChange={(newFiles) => {
              setFiles(newFiles);
              setError(null);
              setResult(null);
            }} 
          />
        )}

        {/* Processing Action */}
        {files.length > 0 && !result && (
          <div className="flex justify-center">
            <button
              onClick={handleProcessDocument}
              disabled={isProcessing}
              className={`
                px-8 py-3 rounded-lg font-semibold text-white shadow-lg shadow-blue-500/30 transition-all
                ${isProcessing ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:scale-105'}
              `}
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing {files.length} File{files.length > 1 ? 's' : ''}...
                </span>
              ) : `Convert ${files.length} File${files.length > 1 ? 's' : ''} to Excel`}
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200 flex items-center gap-3 animate-fade-in">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 flex-shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            {error}
          </div>
        )}

        {/* Results Dashboard */}
        {result && (
          <div className="space-y-6 animate-fade-in">
            
            <SummaryCards data={result} />

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-slate-800">
                Transactions <span className="ml-2 text-sm font-normal text-slate-500 bg-slate-100 px-2 py-1 rounded-full">{result.transactions.length} items</span>
              </h2>
              <div className="flex gap-3">
                <button 
                  onClick={resetApp}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                >
                  Start Over
                </button>
                <button 
                  onClick={handleDownloadExcel}
                  className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold shadow-md shadow-green-500/20 transition-all flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Download Excel
                </button>
              </div>
            </div>

            <TransactionTable transactions={result.transactions} />
            
            <ExcludedTable transactions={result.excludedTransactions} />

          </div>
        )}
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
