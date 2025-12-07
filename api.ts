
import { GoogleGenAI, Type } from "@google/genai";
import { RawExtractionResponse } from "./types";

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
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
