import { FastifyInstance } from "fastify";
import { createExpenseHandler, getExpenseByIdHandler } from "./expenses.controller";

export async function expensesRoutes(app: FastifyInstance) {
    app.post("/groups/:groupId/expenses", createExpenseHandler);
    app.get("/groups/:groupId/expenses/:expenseId", getExpenseByIdHandler);
}