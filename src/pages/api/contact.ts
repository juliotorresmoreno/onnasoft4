import type { APIRoute } from "astro";
import { EmailService } from "../../services/email-service";

const emailService = new EmailService();

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    try {
        const data = await request.json();

        const { name, email, subject, message } = data;

        if (!name || !email || !subject || !message) {
            return Response.json(
                { error: "Todos los campos son obligatorios" },
                { status: 400 }
            );
        }

        await emailService.sendContactEmail(
            email,
            name,
            email,
            subject,
            message
        );

        return Response.json(
            {
                success: true,
                message: "Petición recibida correctamente",
                data: { name, email, subject, message },
            },
            { status: 200 }
        );
    } catch {
        return Response.json(
            { error: "No se pudo procesar el JSON" },
            { status: 400 }
        );
    }
};