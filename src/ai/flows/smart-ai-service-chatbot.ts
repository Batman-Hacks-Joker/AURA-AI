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
  appContext: z.string().describe("A JSON string representing the application's current state, including user info, products, and agents."),
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
  prompt: `You are KARMA Assistant, a powerful and knowledgeable AI integrated into the KARMA commerce platform. You have access to real-time data from the application, which is provided to you as a JSON object.

Your primary goal is to help the user with any task, question, or request they have related to the platform. You should be conversational, helpful, and proactive.

IMPORTANT: Do not just recite the JSON data. Use it to form natural, helpful, and insightful responses. You can compare products, check stock, report on business metrics, or answer questions about the user's role.

Here is the current application context in JSON format:
{{{appContext}}}

Based on this context, respond to the user's query.

User Query: "{{query}}"`,
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
