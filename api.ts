import { GoogleGenAI, Type } from "@google/genai";
import { RawExtractionResponse } from "./types";

/**
 * Retrieves the API Key based on the current environment.
 * 1. Checks import.meta.env.VITE_API_KEY (Vite / GitHub Pages)
 * 2. Checks process.env.API_KEY (Google AI Studio / Node)
 */
const getApiKey = (): string => {
  // 1. Vite / Browser Environment
  // @ts-ignore - import.meta is standard in Vite but might not be in all TS configs
  if (import.meta.env && import.meta.env.VITE_API_KEY) {
    // @ts-ignore
    return import.meta.env.VITE_API_KEY;
  }

  // 2. Fallback: Google AI Studio / Node Environment
  // We check typeof process to avoid ReferenceError in pure browsers that don't have it polyfilled
  // @ts-ignore
  if (typeof process !== 'undefined' && process.env?.API_KEY) {
    // @ts-ignore
    return process.env.API_KEY;
  }

  console.error("API Key is missing. Please set VITE_API_KEY in your .env file or GitHub Secrets.");
  return "";
};

const fileToGenerativePart = (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result as string;
      const base64Content = base64Data.split(',')[1];
      resolve({
        inlineData: {
          data: base64Content,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const analyzeDocument = async (file: File): Promise<RawExtractionResponse> => {
  // Dynamically get the key
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  
  const filePart = await fileToGenerativePart(file);

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        filePart,
        {
          text: `You are a highly accurate financial data extraction engine. 
          Analyze this bank statement PDF and extract every single transaction row found in the document.
          
          Rules:
          1. Identify the Date, Description, and Amount for each transaction. Format Date as YYYY-MM-DD.
          2. Determine if the transaction is an INFLOW (Credit/Deposit) or OUTFLOW (Debit/Withdrawal). Look for column headers like "Credit", "Debit", "Payment", "Deposit" or signs (+/-) to decide.
          3. If a transaction spans multiple lines, merge the description into a single line.
          4. Ignore page headers, footers, and summary sections that are not actual transaction rows.
          5. Categorize the transaction based on the description (e.g., Groceries, Salary, Transfer, Utilities).
          6. Ensure 100% accuracy on amounts.
          
          Return the data in JSON format.`
        }
      ]
    },
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          bankName: { type: Type.STRING, description: "Name of the bank if visible" },
          currency: { type: Type.STRING, description: "Currency symbol or code, e.g. USD, $" },
          transactions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                date: { type: Type.STRING, description: "Date in YYYY-MM-DD format" },
                description: { type: Type.STRING },
                amount: { type: Type.NUMBER },
                type: { type: Type.STRING, enum: ["INFLOW", "OUTFLOW"] },
                category: { type: Type.STRING }
              }
            }
          }
        }
      }
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error("No data returned from AI");
  }

  return JSON.parse(text) as RawExtractionResponse;
};