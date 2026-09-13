export interface ExpenseInput {
    id: string;
    paidById: string;
    amount: number;
    shares: ShareInput[];
}

export interface ShareInput {
    userId: string;
    amount: number;
}

export interface Balance {
    userId: string;
    balance: number;
}

export interface SimplifiedTransaction {
    fromUserId: string;
    toUserId: string;
    amount: number;
}

export const CURRENCY_PRECISION = 0;