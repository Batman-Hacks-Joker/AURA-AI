'use server';

/**
 * @fileOverview A smart AI service chatbot for product support and troubleshooting.
 *
 * - smartAiServiceChatbot - A function that handles the chatbot interaction.
 * - SmartAiServiceChatbotInput - The input type for the smartAiServiceChatbot function.
 * - SmartAiServiceChatbotOutput - The return type for the smartAiServiceChatbot function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartAiServiceChatbotInputSchema = z.object({
  query: z.string().describe('The user query, can be text, image data URI, or voice data URI.'),
});
export type SmartAiServiceChatbotInput = z.infer<typeof SmartAiServiceChatbotInputSchema>;

const SmartAiServiceChatbotOutputSchema = z.object({
  response: z.string().describe('The response from the chatbot.'),
});
export type SmartAiServiceChatbotOutput = z.infer<typeof SmartAiServiceChatbotOutputSchema>;

export async function smartAiServiceChatbot(input: SmartAiServiceChatbotInput): Promise<SmartAiServiceChatbotOutput> {
  return smartAiServiceChatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'smartAiServiceChatbotPrompt',
  input: {schema: SmartAiServiceChatbotInputSchema},
  output: {schema: SmartAiServiceChatbotOutputSchema},
  prompt: `You are a smart AI service chatbot that helps customers with product support and troubleshooting.

  Respond to the following query:

  {{query}}`,
});

const smartAiServiceChatbotFlow = ai.defineFlow(
  {
    name: 'smartAiServiceChatbotFlow',
    inputSchema: SmartAiServiceChatbotInputSchema,
    outputSchema: SmartAiServiceChatbotOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
