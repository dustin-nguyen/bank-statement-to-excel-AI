
import { GoogleGenAI, Type } from "@google/genai";
import { RawExtractionResponse } from "./types";

// Access globals from script tags (pdf-lib and pdf.js)
declare const pdfjsLib: any;
declare const PDFLib: any;

/**
 * Pre-processes the PDF on the client side:
 * 1. Classifies the document as Chase if specific keywords are found.
 * 2. If Chase, attempts to find the transaction section to reduce noise/tokens.
 * 3. Returns the processed File.
 */
const preprocessPdf = async (file: File): Promise<File> => {
  try {
    const analysisBuffer = await file.arrayBuffer();
    
    // PDF.js worker can detach the buffer, so we use a fresh Uint8Array view
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(analysisBuffer) });
    const pdf = await loadingTask.promise;
    
    let isChase = false;
    let activityStartPage = -1;

    // Scan more pages (up to 15) to ensure we find the start of transactions
    const pagesToScan = Math.min(pdf.numPages, 15);

    for (let i = 1; i <= pagesToScan; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(" ");
      
      // Detection for Chase
      if (!isChase) {
        if (/Chase|JPMorgan/i.test(pageText)) {
          isChase = true;
        }
      }

      // Detect start of transaction lists with broader patterns
      if (activityStartPage === -1) {
        if (
          /account\s+activity/i.test(pageText) || 
          /transaction\s+detail/i.test(pageText) ||
          /activity\s+detail/i.test(pageText) ||
          /checking\s+summary/i.test(pageText) ||
          /electronic\s+withdrawals/i.test(pageText) ||
          /detail\s+of\s+activity/i.test(pageText)
        ) {
          activityStartPage = i;
        }
      }

      if (isChase && activityStartPage !== -1) break;
    }

    // Conservative trimming: only if we are absolutely sure and it's deep in the doc.
    if (isChase && activityStartPage > 3) {
      const safeStartPage = Math.max(1, activityStartPage - 1);
      console.log(`Chase statement detected. Trimming noise before page ${safeStartPage}.`);
      
      const { PDFDocument } = PDFLib;
      const trimmingBuffer = await file.arrayBuffer();
      const srcDoc = await PDFDocument.load(trimmingBuffer, { ignoreEncryption: true });
      const trimmedDoc = await PDFDocument.create();
      
      const pageIndices = [];
      for (let i = safeStartPage - 1; i < pdf.numPages; i++) {
        pageIndices.push(i);
      }
      
      const copiedPages = await trimmedDoc.copyPages(srcDoc, pageIndices);
      copiedPages.forEach((page: any) => trimmedDoc.addPage(page));
      
      const trimmedPdfBytes = await trimmedDoc.save();
      return new File([trimmedPdfBytes], file.name, { type: 'application/pdf' });
    }

    return file; 
  } catch (err) {
    console.warn("Client-side PDF preprocessing encountered an error, using original file:", err);
    return file; 
  }
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
          mimeType: file.type || 'application/pdf',
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
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
/**
 * Analyzes the bank statement by sending it to Gemini API directly.
 */
export const analyzeDocument = async (file: File): Promise<RawExtractionResponse> => {
  // Initialize AI client with API key from environment
  const ai = new GoogleGenAI({ apiKey: getApiKey() });

  // 1. Client-side preprocessing to optimize extraction
  const processedFile = await preprocessPdf(file);
  
  // 2. Convert to Generative Part
  const filePart = await fileToGenerativePart(processedFile);

  // 3. Prepare the request
  const prompt = `TASK: Extract every single transaction row from this bank statement PDF. 
    Return the data as a JSON object with keys: bankName, currency, and transactions.
    Each transaction row MUST have: 
    - date (YYYY-MM-DD)
    - description
    - amount (numerical positive value)
    - type ("INFLOW" or "OUTFLOW")
    - category (a simple spending category)`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            filePart
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            bankName: { type: Type.STRING },
            currency: { type: Type.STRING },
            transactions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  date: { type: Type.STRING },
                  description: { type: Type.STRING },
                  amount: { type: Type.NUMBER },
                  type: { type: Type.STRING, enum: ["INFLOW", "OUTFLOW"] },
                  category: { type: Type.STRING }
                },
                required: ["date", "description", "amount", "type"]
              }
            }
          },
          required: ["transactions"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("The AI model failed to return any text response.");
    }

    const data = JSON.parse(text);
    if (!data.transactions || !Array.isArray(data.transactions)) {
      throw new Error("No transactions found in the AI response.");
    }

    return data as RawExtractionResponse;
  } catch (error: any) {
    console.error("Extraction failed:", error);
    throw error;
  }
};
