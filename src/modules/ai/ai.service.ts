import { GoogleGenerativeAI, SchemaType, Schema } from "@google/generative-ai";
import { ExtractedReceipt, extractedReceiptSchema } from "./ai.schema";

// const prompt = `
//     You are extracting data from a photo of a receipt. Read every line item, its price, the subtotal, tax, and service charge if present.
//     The receipt may be in Indonesian. There are few terms to keep in mind:
//     - Tax may be labeled as "PPN" or "Pajak" or "Tax" or "PB1"
//     - Service charge may be labeled as "Service Charge" or "SC" or "Biaya Layanan" or "Pelayanan" plus its percentage
//     - Subtotal may be labeled as "Subtotal" or "Total Sebelum Pajak" or "Total Sebelum PPN" plus its percentage
//     - The total amount may be labeled as "Total" or "Grand Total" or "Total Bayar" or "Jumlah Bayar"
//     Rules : 
//     - All monetary amounts must be a whole integer in Indonesian Rupiah (no decimals or thousands separators).
//     - If the restaurant name is not visible, use null.
//     - If the tax or service charge is not present, return 0 for that field.
//     - Subtotal + taxAmount + serviceChargeAmount must equal totalAmount.
//     - Don't mind the roundings made.
//     - Return the data in JSON format with the following structure:
//     {
//         "restaurantName": string | null,
//         "items": [{ "itemName": string, "price": number }],
//         "subtotal": number,
//         "tax": number,
//         "serviceCharge": number,
//         "rounding": number,
//         "totalAmount": number
//     }
// `;

const prompt = `
    You are extracting structured data from a photo of an Indonesian restaurant receipt.

    Indonesian receipt terms to recognize:
    - Tax may be labeled "PPN", "Pajak", or "PB1" (a local restaurant tax).
    - Service charge may be labeled "Service", "SC", or "Service Charge".
    - A "Pembulatan" or rounding (positive or negative) may appear near the total.

    Rules:
    - All monetary amounts must be whole integers in Indonesian Rupiah.
    - Report taxAmount, serviceChargeAmount, and rounding as SEPARATE fields — do not combine them.
    - Subtotal + taxAmount + serviceChargeAmount + rounding must equal totalAmount exactly.
    - If tax or service charge is not present, use 0.
    - If the restaurant name is not visible, use null.
    - Each item's price should be its line total (price × quantity), not the unit price.
`;

const geminiResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    restaurantName: { type: SchemaType.STRING, nullable: true },
    items: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          itemName: { type: SchemaType.STRING },
          price: { type: SchemaType.INTEGER },
        },
        required: ["itemName", "price"],
      },
    },
    subtotal: { type: SchemaType.INTEGER },
    taxAmount: { type: SchemaType.INTEGER },
    serviceChargeAmount: { type: SchemaType.INTEGER },
    rounding: { type: SchemaType.INTEGER },
    totalAmount: { type: SchemaType.INTEGER },
  },
  required: ["items", "subtotal", "taxAmount", "serviceChargeAmount", "rounding", "totalAmount"],
} as const;

export class AiService{
    private genAI: GoogleGenerativeAI;
    private readonly MODEL = 'gemini-3.5-flash';

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY is not set. Add it to the .env file');
        };
        this.genAI = new GoogleGenerativeAI(apiKey);
    }

    async extractReceipt(imageBuffer: Buffer, mimeType: string): Promise<ExtractedReceipt> {
        const model = this.genAI.getGenerativeModel({ model: this.MODEL, generationConfig: { responseMimeType: "application/json", responseSchema: geminiResponseSchema as unknown as Schema} });
        const result = await model.generateContent([
            { text: prompt },
            { inlineData: {
                data: imageBuffer.toString('base64'),
                mimeType,
                }
            }
        ])

        const rawText = result.response.text();

        let parsedJson: unknown;
        try {
            parsedJson = JSON.parse(rawText);
        } catch (error) {
            throw new Error(`The AI did not return valid JSON. Raw response: ${rawText}`);
        }
        
        const validation = extractedReceiptSchema.safeParse(parsedJson);
        if (!validation.success) {
            throw new Error(`AI's response didn't match the expected receipt shape: ${validation.error.message}`);
        }
        return validation.data;
    }
}

export const aiService = new AiService();