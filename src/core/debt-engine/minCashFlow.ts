import { Balance, CURRENCY_PRECISION, SimplifiedTransaction } from "./types";

function round (value: number): number{
    const factor = 10 ** CURRENCY_PRECISION;
    return Math.round((value + Number.EPSILON) * factor) / factor;
}

export function simplifyDebts(balances: Balance[]): SimplifiedTransaction[] {
    const creditors = balances.filter(b => b.balance > 0)
                            .map((b) => ({ userId: b.userId, amount: toMinorUnit(b.balance)}))
                            .sort((a, b) => b.amount - a.amount);

    const debtors = balances.filter(b => b.balance < 0)
                            .map((b) => ({ userId: b.userId, amount: toMinorUnit(-b.balance)}))
                            .sort((a, b) => b.amount - a.amount);

    const totalCredit = creditors.reduce((sum, c) => sum + c.amount, 0);
    const totalDebt = debtors.reduce((sum, d) => sum + d.amount, 0);
    if (totalCredit !== totalDebt) {
        throw new Error(`Balances do not net to zero. Total credit: (${totalCredit}), Total debt: (${totalDebt}).`);
    };

    const transactions: SimplifiedTransaction[] = [];
    let ci = 0; 
    let di = 0; 
    while (ci < creditors.length && di < debtors.length) {
        const creditor = creditors[ci];
        const debtor = debtors[di];
        const settled = Math.min(creditor.amount, debtor.amount);
        if (settled > 0) {
            transactions.push({
                fromUserId: debtor.userId,
                toUserId: creditor.userId,
                amount: fromMinorUnit(settled),
            });
        }
        creditor.amount -= settled;
        debtor.amount -= settled;
        if (creditor.amount === 0) ci++;
        if (debtor.amount === 0) di++;
    }
    return transactions;
}

const MINOR_UNIT_FACTOR = 10 ** CURRENCY_PRECISION;

function toMinorUnit(amount: number): number {
    return Math.round(round(amount) * MINOR_UNIT_FACTOR);
}

function fromMinorUnit(amount: number): number {
    return round(amount / MINOR_UNIT_FACTOR);
}