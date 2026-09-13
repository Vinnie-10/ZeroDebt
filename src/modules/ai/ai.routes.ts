import { FastifyInstance } from "fastify";
import { extractReceiptHandler } from "./ai.controller";

export async function aiRoutes(app: FastifyInstance) {
    app.post("/receipts/extract", extractReceiptHandler);
}