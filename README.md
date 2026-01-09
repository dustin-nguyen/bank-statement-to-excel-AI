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
*   **Extraction Layer**: Custom Gemini Worker Endpoint (`https://gemini-ephemeral-token.ducnrg.workers.dev/`)
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