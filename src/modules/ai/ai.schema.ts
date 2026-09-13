import { z } from "zod";

// const chargedFields = z.union([
//   z.number().int().nonnegative(),
//   z.object({
//     percentage: z.number().int().optional(),
//     amount: z.number().int().nonnegative(),
//   }),
// ]).nullable().optional();

// export const rawExtractedItemSchema = z.object({
//   restaurantName: z.string().nullable().optional(),
//   items: z.array(z.object({
//     itemName: z.string(),
//     qty: z.number().int().nonnegative().default(1),
//     price: z.number().int().nonnegative(),
//   })),
//   subtotal: z.number().int().nonnegative(),
//   serviceCharge: chargedFields,
//   tax: chargedFields,
//   rounding: z.number().int().default(0),
//   totalAmount: z.number().int().nonnegative(),
// });

// export type RawExtraction = z.infer<typeof rawExtractedItemSchema>;

export const extractedReceiptSchema = z.object({
  restaurantName: z.string().nullable(),
  items: z.array(z.object({
    itemName: z.string(),
    price: z.number().int().nonnegative(),
  })),
  subtotal: z.number().int().nonnegative(),
  taxAmount: z.number().int().nonnegative().default(0),
  serviceChargeAmount: z.number().int().nonnegative().default(0),
  rounding: z.number().int().default(0),
  totalAmount: z.number().int().nonnegative(),
});

export type ExtractedReceipt = z.infer<typeof extractedReceiptSchema>;

// function extractAmount(field: number | { amount: number } | null | undefined): number {
//   if (field == null) return 0;
//   if (typeof field === "number") return field;
//   return field.amount;
// }

// export function transformRawExtraction(raw: RawExtraction): ExtractedReceipt {
//   const serviceChargeAmount = extractAmount(raw.serviceCharge);
//   const baseTax = extractAmount(raw.tax);
//   const taxAmount = baseTax + raw.rounding;
//   return{
//     restaurantName: raw.restaurantName ?? null,
//     items: raw.items.map(item => ({
//       itemName: item.itemName,
//       price: item.price,
//     })),
//     subtotal: raw.subtotal,
//     taxAmount,
//     serviceChargeAmount,
//     totalAmount: raw.totalAmount,
//   };
// }