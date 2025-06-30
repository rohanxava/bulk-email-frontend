
'use server';
/**
 * @fileOverview A flow for sending user invitation emails.
 *
 * - sendInvitationEmail - A function that creates a user and sends an invitation.
 * - SendInvitationEmailInput - The input type for the sendInvitationEmail function.
 * - SendInvitationEmailOutput - The return type for the sendInvitationEmail function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import sgMail from '@sendgrid/mail';

// Set the API key from environment variables
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  console.warn('SENDGRID_API_KEY is not set. Email sending will be disabled.');
}

const SendInvitationEmailInputSchema = z.object({
  name: z.string().describe("The full name of the new user."),
  email: z.string().email().describe("The email address of the new user."),
  role: z.string().describe("The assigned role for the new user."),
  password: z.string().describe("The password for the new user."),
});
export type SendInvitationEmailInput = z.infer<typeof SendInvitationEmailInputSchema>;

const SendInvitationEmailOutputSchema = z.object({
  success: z.boolean(),
  error: z.string().optional(),
});
export type SendInvitationEmailOutput = z.infer<typeof SendInvitationEmailOutputSchema>;

export async function sendInvitationEmail(input: SendInvitationEmailInput): Promise<SendInvitationEmailOutput> {
  return sendInvitationEmailFlow(input);
}

const sendInvitationEmailFlow = ai.defineFlow(
  {
    name: 'sendInvitationEmailFlow',
    inputSchema: SendInvitationEmailInputSchema,
    outputSchema: SendInvitationEmailOutputSchema,
  },
  async (input) => {
    const { name, email, role, password } = input;

    if (!process.env.SENDGRID_API_KEY || process.env.SENDGRID_API_KEY === 'YOUR_SENDGRID_API_KEY_HERE') {
      return { success: false, error: 'SendGrid API key not configured.' };
    }
    
    const fromEmail = 'no-reply@example.com'; // TODO: Use a real, verified sender email
    const loginUrl = 'http://localhost:9002/'; // TODO: Replace with your actual app URL

    const emailSubject = `You're invited to Agency MailFlow!`;
    const htmlContent = `
      <h1>Welcome to Agency MailFlow, ${name}!</h1>
      <p>An account has been created for you with the role: <strong>${role}</strong>.</p>
      <p>You can log in with the following credentials:</p>
      <ul>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Password:</strong> <code>${password}</code></li>
      </ul>
      <p>Please log in and change your password if you wish.</p>
      <a href="${loginUrl}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login Now</a>
      <br>
      <p>If you have any questions, please contact your administrator.</p>
    `;

    try {
      const msg = {
        to: email,
        from: fromEmail,
        subject: emailSubject,
        html: htmlContent,
      };
      await sgMail.send(msg);

      // In a real application, you would also save the new user to your Firestore database here.

      return { success: true };

    } catch (error: any) {
      console.error('Error sending invitation email:', error.response?.body || error.message);
      return { success: false, error: error.response?.body?.errors[0]?.message || 'Failed to send invitation.' };
    }
  }
);
