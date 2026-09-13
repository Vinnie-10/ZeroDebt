import z from "zod";

export const createExpenseSchema = z.object({
    paidById: z.string().min(1),
    description: z.string(),
    tax: z.number().int().min(1).default(0),
    serviceCharge: z.number().int().min(1).default(0),
    rounding: z.number().int().default(0),
    items: z.array(z.object({
        itemName: z.string().min(1),
        price: z.number().int().positive(),
        shares: z.array(z.object({
            userId: z.string().min(1),
            amount: z.number().int().positive(),
        })).min(1),
    })).min(1),
});

export type CreateExpenseBody = z.infer<typeof createExpenseSchema>;