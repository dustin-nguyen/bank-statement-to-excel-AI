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

*   **Frontend**: React, TypeScript, Vite
*   **Styling**: Tailwind CSS (via CDN)
*   **AI Model**: Google Gemini 2.5 Flash (`@google/genai` SDK)
*   **Excel Generation**: SheetJS (`xlsx` library via CDN)

---

## 🌐 Live Demo & Deployment

This project is configured to be deployed on GitHub Pages.

**Live URL**: `https://dustin-nguyen.github.io/bank-statement-to-excel-AI/`

### How to Deploy

1.  **Repository Secrets**:
    Go to your GitHub Repository -> Settings -> Secrets and variables -> Actions.
    Create a new repository secret named `API_KEY` with your Google Gemini API Key.

2.  **Push to Main**:
    Any push to the `main` branch will trigger the GitHub Action defined in `.github/workflows/deploy.yml`.

3.  **Workflow Process**:
    *   Installs dependencies (`npm ci`).
    *   Builds the app using Vite (`npm run build`).
    *   Injects the `API_KEY` into the build.
    *   Deploys the generated `dist/` folder to the `gh-pages` branch.

### Manual Setup (Local)

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Set up Environment**:
    Create a `.env` file in the root directory:
    ```
    API_KEY=your_google_gemini_api_key
    ```

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```

4.  **Build**:
    ```bash
    npm run build
    ```

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
