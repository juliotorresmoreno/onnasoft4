import { Resend } from "resend";

export class EmailService {
    private resend: Resend;
    private fromEmail: string;
    private contactEmail: string;

    constructor() {
        this.resend = new Resend(import.meta.env.RESEND_API_KEY);
        this.fromEmail = import.meta.env.FROM_EMAIL;
        this.contactEmail = import.meta.env.CONTACT_EMAIL;
    }

    async sendContactEmail(to: string, name: string, email: string, subject: string, message: string) {
        try {
            await this.resend.emails.send({
                from: this.fromEmail,
                to: email,
                subject: subject,
                html: `<p><strong>Nombre:</strong> ${name}</p><p><strong>Correo:</strong> ${email}</p><p><strong>Mensaje:</strong> ${message}</p>`
            });
        } catch (error) {
            console.error("Error sending contact email:", error);
            throw new Error("Failed to send contact email");
        }
    }
}