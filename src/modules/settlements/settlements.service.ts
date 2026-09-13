import { prisma } from "../../plugins/prisma";
import { computeBalances } from "../../core/debt-engine/graph";
import { simplifyDebts } from "../../core/debt-engine/minCashFlow";
import {
  Balance,
  ExpenseInput,
  SimplifiedTransaction,
} from "../../core/debt-engine/types";
import { RecordSettlementBody } from "./settlements.schema";

export async function buildExpenseInputsForGroup(groupId: string):
    Promise<ExpenseInput[]> {
        const expenses = await prisma.expense.findMany({
            where: { groupId },
            include: {
                items: {
                    include: {shares: true},
                },
            },
        });
        return expenses.map((expense) => {
            const rawShare = new Map<string, number>();
            for (const item of expense.items) {
                for (const share of item.shares) {
                    rawShare.set(share.userId, (rawShare.get(share.userId) ?? 0) + share.amount);
                }
            }
            const subtotal = expense.subtotal;
            const extraCharges = expense.tax + expense.serviceCharge;

            const userIds = Array.from(rawShare.keys());
            const dividedShares: { userId: string; amount: number }[] = [];
            let allocatedExtra = 0;

            userIds.forEach((userId, index) => {
                const raw = rawShare.get(userId) ?? 0;
                const isLastUser = index === userIds.length - 1;

                let extraShare: number;
                if (isLastUser) {
                    extraShare = extraCharges - allocatedExtra;
                } else {
                    extraShare = subtotal === 0 ? 0 : Math.round((raw / subtotal) * extraCharges);
                    allocatedExtra += extraShare;
                }
                dividedShares.push({ userId, amount: raw + extraShare });
            });

            return {
                id: expense.id,
                paidById: expense.paidById,
                amount: expense.totalAmount,
                shares: dividedShares
            } satisfies ExpenseInput;
        });
}

export async function recordSettlement(groupId: string, body: RecordSettlementBody) {
    if (body.fromUserId === body.toUserId) {
        throw new Error("fromUserId and toUserId cannot be the same");
    }
    const settlement = await prisma.settlement.create({
        data: {
            groupId,
            fromUserId: body.fromUserId,
            toUserId: body.toUserId,
            amount: body.amount
        }
    });
    return settlement;
}

async function applySettlementToBalances(groupId: string,balances: Balance[]): Promise<Balance[]> {
    const settlements = await prisma.settlement.findMany({
        where: { groupId }
    });
    const balanceMap = new Map(balances.map(b => [b.userId, b.balance]));
    for (const s of settlements) {
        const fromBalance = balanceMap.get(s.fromUserId) ?? 0;
        const toBalance = balanceMap.get(s.toUserId) ?? 0;
        balanceMap.set(s.fromUserId, fromBalance + s.amount);
        balanceMap.set(s.toUserId, toBalance - s.amount);
    }
    return Array.from(balanceMap.entries())
        .map(([userId, balance]) => ({ userId, balance }))
        .filter((b) => b.balance !== 0);
}

export async function getSettlementPlan(groupId: string): Promise<{ balances: Balance[]; transactions: SimplifiedTransaction[] }> {
    const expenseInputs = await buildExpenseInputsForGroup(groupId);
    const rawBalances = computeBalances(expenseInputs);
    const balances = await applySettlementToBalances(groupId, rawBalances);
    const transactions = simplifyDebts(balances);

    return { balances, transactions };
}
