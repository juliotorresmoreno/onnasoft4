import { Resend } from "resend";

const escapeHtml = (value: string) =>
    value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

export class EmailService {
    private resend: Resend;
    private fromEmail: string;
    private contactEmail: string;

    constructor() {
        this.resend = new Resend(import.meta.env.RESEND_API_KEY);
        this.fromEmail = import.meta.env.FROM_EMAIL;
        this.contactEmail = import.meta.env.CONTACT_EMAIL;
    }

    /**
     * Sends a contact form submission to the OnnaSoft inbox (CONTACT_EMAIL).
     * The visitor's address is set as reply-to so the team can answer directly.
     */
    async sendContactEmail(name: string, email: string, subject: string, message: string) {
        if (!this.contactEmail) {
            throw new Error("CONTACT_EMAIL is not configured");
        }

        const { error } = await this.resend.emails.send({
            from: this.fromEmail,
            to: this.contactEmail,
            replyTo: email,
            subject: `Contacto web: ${subject}`,
            html: `<p><strong>Nombre:</strong> ${escapeHtml(name)}</p><p><strong>Correo:</strong> ${escapeHtml(email)}</p><p><strong>Asunto:</strong> ${escapeHtml(subject)}</p><p><strong>Mensaje:</strong><br>${escapeHtml(message).replace(/\n/g, "<br>")}</p>`,
        });

        if (error) {
            console.error("Error sending contact email:", error);
            throw new Error("Failed to send contact email");
        }
    }
}
