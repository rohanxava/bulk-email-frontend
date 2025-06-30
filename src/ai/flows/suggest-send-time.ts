'use server';

/**
 * @fileOverview Suggests the optimal time to send an email to increase open rates.
 *
 * - suggestSendTime - A function that suggests the optimal send time.
 * - SuggestSendTimeInput - The input type for the suggestSendTime function.
 * - SuggestSendTimeOutput - The return type for the suggestSendTime function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestSendTimeInputSchema = z.object({
  emailContent: z
    .string()
    .describe('The content of the email to be sent.'),
  pastEmailData: z
    .string()
    .optional()
    .describe(
      'Optional data about past email performance, useful for personalization.'
    ),
});
export type SuggestSendTimeInput = z.infer<typeof SuggestSendTimeInputSchema>;

const SuggestSendTimeOutputSchema = z.object({
  suggestedSendTime: z
    .string()
    .describe(
      'A suggested time within the next 24 hours to send the email, in ISO 8601 format (e.g., 2024-07-22T10:30:00Z).'
    ),
  reasoning: z
    .string()
    .describe(
      'The reasoning behind the suggested send time, based on email content and general engagement patterns.'
    ),
});
export type SuggestSendTimeOutput = z.infer<typeof SuggestSendTimeOutputSchema>;

export async function suggestSendTime(
  input: SuggestSendTimeInput
): Promise<SuggestSendTimeOutput> {
  return suggestSendTimeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestSendTimePrompt',
  input: {schema: SuggestSendTimeInputSchema},
  output: {schema: SuggestSendTimeOutputSchema},
  prompt: `You are an AI assistant specializing in email marketing optimization.
  Given the content of an email, and optionally, data from past email performance, you will suggest the optimal time to send the email within the next 24 hours to maximize open rates. Always respond with a time in ISO 8601 format and give a reason for your choice.

  Email Content: {{{emailContent}}}

  Past Email Data (Optional): {{{pastEmailData}}}
  `,
});

const suggestSendTimeFlow = ai.defineFlow(
  {
    name: 'suggestSendTimeFlow',
    inputSchema: SuggestSendTimeInputSchema,
    outputSchema: SuggestSendTimeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
