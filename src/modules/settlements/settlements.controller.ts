import { FastifyReply, FastifyRequest } from "fastify";
import { recordSettlementSchema } from "./settlements.schema";
import { recordSettlement } from "./settlements.service";

export async function recordSettlementHandler(
    req: FastifyRequest<{ Params: {groupId: string}}>,
    reply: FastifyReply
){
    const body = recordSettlementSchema.parse(req.body);
    const settlement = await recordSettlement(req.params.groupId, body);
    return reply.status(201).send(settlement);
}