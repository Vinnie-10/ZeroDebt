import { FastifyReply, FastifyRequest } from "fastify";
import { createExpenseSchema } from "./expenses.schema";
import { createExpense, getExpenseById } from "./expenses.service";

export async function createExpenseHandler(
    req: FastifyRequest<{ Params: { groupId: string } }>,
    reply: FastifyReply
) {
    const body = createExpenseSchema.parse(req.body);
    const expense = await createExpense(req.params.groupId, body);
    return reply.status(201).send(expense);
}

export async function getExpenseByIdHandler(
    req: FastifyRequest<{ Params: { groupId: string; expenseId: string } }>,
    reply: FastifyReply
) {
    const expense = await getExpenseById(req.params.groupId, req.params.expenseId);
    return reply.status(200).send(expense);
}