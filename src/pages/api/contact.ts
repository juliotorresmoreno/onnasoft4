import type { APIRoute } from "astro";
import Joi from "joi";
import { EmailService } from "../../services/email-service";

// Same rules as the client-side validation in src/scripts/contact-form.ts
const contactSchema = Joi.object({
    name: Joi.string().trim().min(2).max(50).required(),
    email: Joi.string().trim().email({ tlds: { allow: false } }).required(),
    subject: Joi.string().trim().min(5).max(100).required(),
    message: Joi.string().trim().min(10).max(1000).required(),
});

const emailService = new EmailService();

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    let body: unknown;

    try {
        body = await request.json();
    } catch {
        return Response.json({ error: "invalid_json" }, { status: 400 });
    }

    const { error, value } = contactSchema.validate(body, {
        abortEarly: false,
        stripUnknown: true,
    });

    if (error) {
        // Return the invalid field names; the client shows its own translated messages.
        const fields = [
            ...new Set(
                error.details
                    .map((detail) => detail.path[0])
                    .filter((field): field is string => typeof field === "string")
            ),
        ];

        return Response.json(
            { error: "validation_failed", fields },
            { status: 400 }
        );
    }

    try {
        await emailService.sendContactEmail(
            value.name,
            value.email,
            value.subject,
            value.message
        );
    } catch {
        return Response.json({ error: "email_failed" }, { status: 500 });
    }

    return Response.json({ success: true }, { status: 200 });
};
