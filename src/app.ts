import Fastify from "fastify";
import cors from "@fastify/cors";
import sensible from "@fastify/sensible";
import multipart from "@fastify/multipart";
import { expensesRoutes } from "./modules/expenses/expenses.routes";
import { settlementsRoutes } from "./modules/settlements/settlements.routes";
import { aiRoutes } from "./modules/ai/ai.routes";

export function buildApp() {
    const app = Fastify({ logger: true });

    app.register(cors);
    app.register(sensible);
    app.register(multipart, {
        limits: { fileSize: 7 * 1024 * 1024 },
    });

    app.register(expensesRoutes);
    app.register(settlementsRoutes);
    app.register(aiRoutes);

    app.setErrorHandler((error, _req, reply) => {
        app.log.error(error);
        const message = error instanceof Error ? error.message : "An unexpected error occurred.";
        reply.status(400).send({ error: message });
    });

    return app;
}