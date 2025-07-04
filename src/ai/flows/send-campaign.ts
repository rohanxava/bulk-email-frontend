'use server';
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import sgMail from '@sendgrid/mail';
import Papa from 'papaparse';

const SendCampaignInputSchema = z.object({
  subject: z.string(),
  htmlContent: z.string(),
  csvContent: z.string(),
  fromEmail: z.string().email(),
  sendgridKey: z.string(), // <- Accept key from project
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
    const { subject, htmlContent, csvContent, fromEmail, sendgridKey } = input;

    if (!sendgridKey) {
      return { success: false, emailsSent: 0, error: 'SendGrid API key not provided.' };
    }

    try {
      sgMail.setApiKey(sendgridKey);

      const parseResult = Papa.parse(csvContent, { header: true, skipEmptyLines: true });
      const contacts = parseResult.data as Record<string, string>[];

      if (!contacts.length || !contacts[0].email) {
        return { success: false, emailsSent: 0, error: 'CSV must have an "email" column and at least one contact.' };
      }

      const sendPromises = contacts.map(contact => {
        let personalizedContent = htmlContent;
        for (const key in contact) {
          const regex = new RegExp(`{{${key}}}`, 'g');
          personalizedContent = personalizedContent.replace(regex, contact[key]);
        }

        return sgMail.send({
          to: contact.email,
          from: fromEmail,
          subject,
          html: personalizedContent,
        });
      });

      await Promise.all(sendPromises);

      return { success: true, emailsSent: contacts.length };

    } catch (error: any) {
      console.error('Error sending campaign:', error.response?.body || error.message);
      return {
        success: false,
        emailsSent: 0,
        error: error.response?.body?.errors?.[0]?.message || 'Failed to send campaign.',
      };
    }
  }
);
