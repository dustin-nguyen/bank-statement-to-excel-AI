
import { Transaction } from "./types";
import { formatDisplayDate } from "./utils";

// Access global XLSX from the script tag
const XLSX = (window as any).XLSX;

export const downloadExcel = (transactions: Transaction[]) => {
  if (!transactions || transactions.length === 0) return;

  const worksheetData = transactions.map(t => ({
    Date: formatDisplayDate(t.date),
    Description: t.description,
    Category: t.category,
    Amount: t.amount,
    Flow: t.type === 'INFLOW' ? t.amount : -t.amount // Helper column for Excel sums
  }));

  // Explicit headers
  const headers = ["Date", "Description", "Category", "Amount", "Flow"];
  const ws = XLSX.utils.json_to_sheet(worksheetData, { header: headers });

  // Calculate range to append Total row
  const range = XLSX.utils.decode_range(ws['!ref']);
  const lastDataRowIndex = range.e.r;
  const totalRowIndex = lastDataRowIndex + 1;
  const lastDataRowExcel = lastDataRowIndex + 1; // 1-based row number for Excel (data starts row 2)

  // Add "TOTAL NET" label to Description column (Column B, index 1)
  const labelCellRef = XLSX.utils.encode_cell({ r: totalRowIndex, c: 1 });
  ws[labelCellRef] = { t: 's', v: 'TOTAL NET' };

  // Add SUM Formula to Flow column (Column E, index 4)
  // Range E2 to E{lastDataRowExcel}
  const formulaCellRef = XLSX.utils.encode_cell({ r: totalRowIndex, c: 4 });
  ws[formulaCellRef] = { t: 'n', f: `SUM(E2:E${lastDataRowExcel})` };

  // Update sheet range to include the new row
  ws['!ref'] = XLSX.utils.encode_range({
    s: range.s,
    e: { r: totalRowIndex, c: range.e.c }
  });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Transactions");

  // Generate filename with current date
  const filename = `Bank_Statement_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, filename);
};
