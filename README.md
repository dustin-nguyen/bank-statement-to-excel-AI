# Bank Statement AI Converter

A modern React application that utilizes Google's **Gemini 2.5 Flash** model to parse, analyze, and convert PDF bank statements into clean, formatted Excel spreadsheets.

## 🚀 Features

*   **Multi-File Support**: Upload and process multiple PDF bank statements simultaneously.
*   **AI-Powered Extraction**: Uses multimodal AI to "read" the PDF visually and extract transaction data with high accuracy.
*   **Smart Filtering**: Automatically identifies and separates specific transactions (e.g., credit card payments, specific fuel charges) based on predefined business rules.
*   **Excel Export**: Generates a `.xlsx` file with:
    *   Formatted dates (`MM/DD`).
    *   Chronological sorting.
    *   Categorized transactions.
    *   **Native Excel Formulas**: The total row uses a real Excel `=SUM()` formula rather than a static value.
*   **Privacy-Focused**: Files are processed in memory and sent directly to the Google GenAI API; no data is stored on a backend server.

---

## 🛠 Tech Stack

*   **Frontend**: React 19, TypeScript
*   **Styling**: Tailwind CSS (via CDN)
*   **AI Model**: Google Gemini 2.5 Flash (`@google/genai` SDK)
*   **Excel Generation**: SheetJS (`xlsx` library via CDN)
*   **Build/Bundling**: ES Modules (Browser-native imports)

---

## 📋 Requirements & Business Rules

The application implements the following specific user requirements:

### 1. Filtering Logic
The app automatically filters out specific transactions. These are displayed in a separate "Excluded" table in the UI and are **not** included in the Excel download or the Net Flow calculation.

**Excluded Patterns:**
*   **Payment Thank You - Web**: Removes credit card payment confirmations to avoid double-counting transfers.
*   **BP Fuel**: Removes transactions containing "bp fuel".
*   **Kroger Fuel**: Removes transactions containing "kroger fuel".
*   **Total Wine**: Removes transactions containing "total wine".
*   **BP#**: Removes any transaction description starting with `BP#` (e.g., "BP#123456").

### 2. Date Formatting & Sorting
*   **Input**: The AI extracts dates in `YYYY-MM-DD` (ISO) format for accurate sorting.
*   **Sorting**: All transactions are sorted chronologically (Oldest to Newest).
*   **Output**: The Excel sheet and UI display dates in `MM/DD` format.

### 3. Excel Structure
*   **Columns**: Date, Description, Category, Amount, Flow.
*   **Flow Column**: Represents the signed amount (Positive for Inflow, Negative for Outflow).
*   **Total Row**: The final row contains a "TOTAL NET" label and a dynamic Excel formula `=SUM(E2:E[n])` to calculate the total balance.
*   **Type Column**: Removed from the final Excel output as requested.

---

## 🤖 AI Prompt Strategy

The application uses the `gemini-2.5-flash` model. The PDF is converted to a Base64 string and sent as an inline data part.

**System Instruction:**

> "You are a highly accurate financial data extraction engine. Analyze this bank statement PDF and extract every single transaction row found in the document."

**Rules provided to AI:**
1.  **Identify Fields**: Extract Date, Description, and Amount. Format Date as `YYYY-MM-DD`.
2.  **Determine Flow**: Identify INFLOW (Credit/Deposit) vs OUTFLOW (Debit/Withdrawal) by looking for column headers (Credit, Debit, Payment) or signs (+/-).
3.  **Merge Lines**: If a transaction spans multiple lines, merge the description into a single line.
4.  **Ignore Noise**: Ignore page headers, footers, and summary sections.
5.  **Categorize**: specific category based on description (Groceries, Salary, Utilities, etc.).
6.  **JSON Output**: Return data in a strict JSON schema.

---

## 🏃‍♂️ How to Run

### Prerequisites
*   A Google AI Studio API Key.
*   A modern web browser (Chrome/Edge/Firefox).
*   Node.js (optional, if running locally outside of the provided environment).

### Environment Variables
The application expects the API key to be available via `process.env.API_KEY`.

### Running Locally (Vite/CRA)

1.  **Clone the repository** (or copy the files).
2.  **Install dependencies** (if using a package manager):
    ```bash
    npm install react react-dom @google/genai
    ```
    *Note: The provided code uses CDN imports in `index.html` for SheetJS and Tailwind, and ES modules for React/GenAI. If migrating to a standard build step, you will need to install these packages.*

3.  **Set up API Key**:
    Create a `.env` file:
    ```
    API_KEY=your_google_gemini_api_key
    ```

4.  **Start the server**:
    ```bash
    npm run dev
    ```

### Running in this Environment
Simply ensure `metadata.json` or the environment configuration includes your valid Google Cloud/AI Studio API key, and the `index.html` will automatically load the application.
