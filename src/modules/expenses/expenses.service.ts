import { prisma } from "../../plugins/prisma";
import { CreateExpenseBody } from "./expenses.schema";

export async function createExpense(groupId: string, body: CreateExpenseBody){
    const subtotal = body.items.reduce((sum, item) => sum + item.price, 0);
    const combinedTax = body.tax + body.rounding;
    const totalAmount = subtotal + combinedTax + body.serviceCharge;

    for (const item of body.items) {
        const shareSum = item.shares.reduce((sum, share) => sum + share.amount, 0);
        if (shareSum !== item.price) {
            throw new Error(`Shares for item "${item.itemName}" do not sum up to the item price.`);
        };
    }

    const expense = await prisma.expense.create({
        data: {
            groupId,
            paidById: body.paidById,
            description: body.description,
            subtotal,
            tax: combinedTax,
            serviceCharge: body.serviceCharge,
            rounding: body.rounding,
            totalAmount,
            items: {
                create: body.items.map(item => ({
                    itemName: item.itemName,
                    price: item.price,
                    shares: {
                        create: item.shares.map(share => ({
                            userId: share.userId,
                            amount: share.amount,
                        })),
                    }
                })),
            },
        },
        include: {
            items: {
                include: { shares: true },
            },
        },
    });
    return expense;
}

export async function getExpenseById(groupId: string, expenseId: string) {
    const expense = await prisma.expense.findFirst({
        where: { id: expenseId, groupId },
        include: {
            items: { include : { shares: true }},
            paidBy: { select: { id: true, name: true } },
        },
    });
    if (!expense) {
        throw new Error("Expense not found in this group");
    }
    return expense;
}