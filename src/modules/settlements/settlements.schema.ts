import z from "zod";

export const recordSettlementSchema = z.object({
    fromUserId: z.string().min(1),
    toUserId: z.string().min(1),
    amount: z.number().int().positive()
});

export type RecordSettlementBody = z.infer<typeof recordSettlementSchema>;