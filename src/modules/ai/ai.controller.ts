import { FastifyRequest, FastifyReply } from "fastify";
import { aiService } from "./ai.service";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE_BYTES = 7 * 1024 * 1024;

export async function extractReceiptHandler(
    req: FastifyRequest,
    reply: FastifyReply
) {
    const file = await req.file();

    if (!file) {
        throw new Error("No image file was uploaded.");
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        throw new Error(`Unsupported file type: ${file.mimetype}. Use JPEG, PNG, or WebP.`);
    }

    const buffer = await file.toBuffer();

    if (buffer.length > MAX_FILE_SIZE_BYTES) {
        throw new Error("Image file is too large (max 7MB).");
    }

    const extracted = await aiService.extractReceipt(buffer, file.mimetype);
    return reply.status(200).send(extracted);
}