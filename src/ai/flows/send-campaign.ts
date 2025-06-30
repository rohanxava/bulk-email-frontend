'use server';
/**
 * @fileOverview A flow for sending email campaigns using SendGrid.
 *
 * - sendCampaign - A function that processes and sends the campaign.
 * - SendCampaignInput - The input type for the sendCampaign function.
 * - SendCampaignOutput - The return type for the sendCampaign function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import sgMail from '@sendgrid/mail';
import Papa from 'papaparse';

// Set the API key from environment variables
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  console.warn('SENDGRID_API_KEY is not set. Email sending will be disabled.');
}

const SendCampaignInputSchema = z.object({
  subject: z.string().describe('The subject line of the email.'),
  htmlContent: z.string().describe('The HTML content of the email.'),
  csvContent: z.string().describe('The content of the contacts CSV file.'),
  fromEmail: z.string().email().describe('The email address to send from.'),
});
export type SendCampaignInput = z.infer<typeof SendCampaignInputSchema>;

const SendCampaignOutputSchema = z.object({
  success: z.boolean(),
  emailsSent: z.number(),
  error: z.string().optional(),
});
export type SendCampaignOutput = z.infer<typeof SendCampaignOutputSchema>;

export async function sendCampaign(input: SendCampaignInput): Promise<SendCampaignOutput> {
  return sendCampaignFlow(input);
}

const sendCampaignFlow = ai.defineFlow(
  {
    name: 'sendCampaignFlow',
    inputSchema: SendCampaignInputSchema,
    outputSchema: SendCampaignOutputSchema,
  },
  async (input) => {
    const { subject, htmlContent, csvContent, fromEmail } = input;

    if (!process.env.SENDGRID_API_KEY || process.env.SENDGRID_API_KEY === 'YOUR_SENDGRID_API_KEY_HERE') {
      return { success: false, emailsSent: 0, error: 'SendGrid API key not configured.' };
    }

    try {
      const parseResult = Papa.parse(csvContent, { header: true, skipEmptyLines: true });
      const contacts = parseResult.data as Record<string, string>[];

      if (!contacts.length || !contacts[0] || !contacts[0].email) {
          return { success: false, emailsSent: 0, error: 'CSV must have an "email" column and at least one contact.' };
      }
      
      const sendPromises = contacts.map(contact => {
        let personalizedContent = htmlContent;
        // Basic personalization
        for (const key in contact) {
          const regex = new RegExp(`{{${key}}}`, 'g');
          personalizedContent = personalizedContent.replace(regex, contact[key]);
        }

        const msg = {
          to: contact.email,
          from: fromEmail, 
          subject: subject,
          html: personalizedContent,
        };
        return sgMail.send(msg);
      });

      await Promise.all(sendPromises);

      return { success: true, emailsSent: contacts.length };

    } catch (error: any) {
      console.error('Error sending campaign:', error.response?.body || error.message);
      return { success: false, emailsSent: 0, error: error.response?.body?.errors[0]?.message || 'Failed to send campaign.' };
    }
  }
);