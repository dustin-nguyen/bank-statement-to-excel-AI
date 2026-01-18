# Bank Statement AI Converter

A modern React application that utilizes **Gemini** via a managed worker to parse, analyze, and convert PDF bank statements into clean, formatted Excel spreadsheets.

## 🚀 Features

*   **Multi-File Support**: Upload and process multiple PDF bank statements simultaneously.
*   **AI-Powered Extraction**: Uses Gemini multimodal capabilities to extract transaction data from complex document layouts.
*   **Smart Filtering**: Automatically identifies and separates specific transactions (e.g., credit card payments, specific fuel charges) based on predefined business rules.
*   **Excel Export**: Generates a `.xlsx` file with:
    *   Formatted dates (`MM/DD`).
    *   Chronological sorting.
    *   Categorized transactions.
    *   **Native Excel Formulas**: The total row uses a real Excel `=SUM()` formula for dynamic calculation.
*   **Privacy-Focused**: Files are processed in memory and sent via encrypted HTTPS to the Gemini processing worker.

---

## 🛠 Tech Stack

*   **Frontend**: React, TypeScript, Vite
*   **Styling**: Tailwind CSS (via CDN)
*   **Excel Generation**: SheetJS (`xlsx` library via CDN)
*   **PDF Processing**: PDF-Lib & PDF.js (via CDN)

---

## 🌐 Deployment

This project is configured to be deployed on GitHub Pages.

**Live URL**: `https://dustin-nguyen.github.io/bank-statement-to-excel-AI/`

---

## 📋 Requirements & Business Rules

The application implements the following specific user requirements:

### 1. Filtering Logic
The app automatically filters out specific transactions. These are displayed in a separate "Excluded" table in the UI and are **not** included in the Excel download or the Net Flow calculation.

**Excluded Patterns:**
*   **Payment Thank You - Web/Mobile**: Removes credit card payment confirmations.
*   **BP Fuel / BP#**: Removes transactions containing "bp fuel" or starting with "BP#".
*   **Kroger Fuel**: Removes transactions containing "kroger fuel".
*   **Total Wine**: Removes transactions containing "total wine".

### 2. Date Formatting & Sorting
*   **Input**: Extracted in `YYYY-MM-DD` (ISO) format for accurate chronological sorting.
*   **Sorting**: All transactions are sorted Oldest to Newest.
*   **Output**: The Excel sheet and UI display dates in `MM/DD` format.

### 3. Excel Structure
*   **Columns**: Date, Description, Category, Amount, Flow.
*   **Flow Column**: Represents the signed amount (Positive for Inflow, Negative for Outflow).
*   **Total Row**: Features a "TOTAL NET" label and a dynamic Excel formula `=SUM(E2:E[n])`.

## Prompt
You are an expert full-stack developer. Your task is to generate a complete, professional, single-page React application using TypeScript and Tailwind CSS that converts bank statement PDFs into a sortable, clean Excel spreadsheet.

The application must follow these specific requirements:

**1. Functional Requirements (Core Logic):**
*   **Input:** Accepts bank statement PDF files via a drag-and-drop UI.
*   **Output:** Generates an `.xlsx` file using the SheetJS (xlsx) library (loaded via CDN script in `index.html`).
*   **AI Model:** Uses the Google `gemini-3-pro-preview` model for extraction.
*   **API Connection:** Connects via the `@google/genai` npm library. The API key should be sourced from `process.env.API_KEY` to support deployment injection.

**2. Data Extraction and Processing Rules:**
*   **Prompt Engineering:** The AI prompt must explicitly ask the model to:
    *   Extract every single transaction row.
    *   Return data as JSON.
    *   Provide dates in `YYYY-MM-DD` format for sorting consistency.
    *   Identify "INFLOW" vs "OUTFLOW" based on statement context (+/- signs, Credit/Debit columns).
*   **Structured Output:** The API call **must** use `responseMimeType: "application/json"` and include a comprehensive `responseSchema` defining the exact structure required for `bankName`, `currency`, and an array of `transactions` (each with `date`, `description`, `amount`, `type`, `category`). Use `Type.OBJECT`, `Type.ARRAY`, etc.
*   **Filtering Logic (Business Rules):** The app must filter out transactions matching the following criteria (case-insensitive):
    *   Contains the exact phrase: "payment thank you - web"
    *   Contains the exact phrase: "bp fuel"
    *   Contains the exact phrase: "kroger fuel"
    *   Starts with the exact prefix: "BP#"
    *   Contains the exact phrase: "total wine"
*   **Sorting and Formatting:**
    *   All transactions (kept and excluded) must be sorted chronologically by date (`YYYY-MM-DD`).
    *   Dates displayed in the UI and exported to Excel must be formatted as `MM/DD`.

**3. Excel Generation Requirements:**
*   The generated Excel sheet must include columns: `Date (MM/DD)`, `Description`, `Category`, `Amount`, `Flow (Net +/-)`. The `Type` column should be omitted.
*   The final row of the Excel sheet must contain a label "TOTAL NET" and an Excel `SUM` formula dynamically calculating the total of the `Flow` column (e.g., `SUM(E2:E45)`). Do not calculate the sum in JavaScript.

**4. User Interface (UI) Requirements:**
*   **State Management:** Display states for Idle, Uploading, Processing (with spinner), Success, and Error.
*   **Main Dashboard:** Show Total Inflow, Total Outflow, and a table of the kept transactions.
*   **Filtered Section:** A dedicated, visually distinct (e.g., grayed out) section titled "Filtered Transactions (Excluded)" must display all items that matched the filter rules above, sorted chronologically.
*   **Cleanliness:** The code should be clean, modular, and separated into appropriate files (`index.tsx`, `types.ts`, `utils.ts`, `api.ts`, `excel.ts`).

**Provide the complete source code for all necessary files: `index.html`, `package.json`, `index.tsx`, `types.ts`, `utils.ts`, `api.ts`, and `excel.ts`.**



