import { FastifyInstance, FastifyRequest } from "fastify";
import { getSettlementPlan } from "./settlements.service";
import { recordSettlementHandler } from "./settlements.controller";

export async function settlementsRoutes(app: FastifyInstance) {
    app.get(
        "/groups/:groupId/settlements", 
        async (req: FastifyRequest<{ Params: { groupId: string } }>) => {
            return getSettlementPlan(req.params.groupId);
        }
    );
    app.post("/groups/:groupId/settlements", recordSettlementHandler);
}