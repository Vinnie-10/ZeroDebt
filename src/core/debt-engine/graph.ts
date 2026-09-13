import { Balance, CURRENCY_PRECISION, ExpenseInput } from "./types";

function round (value: number): number{
    const factor = 10 ** CURRENCY_PRECISION;
    return Math.round((value + Number.EPSILON) * factor) / factor;
}

export function computeBalances(expenses: ExpenseInput[]): Balance[] {
    const balances= new Map<string, number>();

    const addToBalance = (userId: string, amount: number) => {
        balances.set(userId, round((balances.get(userId) ?? 0) + amount));
    };

    for (const e of expenses){
        validateExpense(e);
        addToBalance(e.paidById, e.amount);
        for (const s of e.shares){
            addToBalance(s.userId, -s.amount);
        }
    }

    return Array.from(balances.entries())
        .map(([userId, balance]) => ({ userId, balance }))
        .filter((b) => b.balance !== 0)
        .sort((a, b) => a.userId.localeCompare(b.userId));
}

function validateExpense(expense: ExpenseInput): void {
    const shareSum = round(expense.shares.reduce((sum, share) => sum + share.amount, 0));
    const expenseAmount = round(expense.amount);

    if (Math.abs(shareSum - expenseAmount) > 0.01) {
        throw new Error(`Expense ${expense.id}: shares sum to ${shareSum}, but expense amount is ${expenseAmount}.`);
    }
}