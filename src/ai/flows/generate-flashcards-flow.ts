
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating Q&A flashcards from a document.
 *
 * The flow takes a document's data URI as input and returns a set of questions and answers.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const FlashcardInputSchema = z.object({
  documentDataUri: z.string().describe(
    "A document file (PDF, DOC, TXT) as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
});
export type FlashcardInput = z.infer<typeof FlashcardInputSchema>;

const FlashcardSchema = z.object({
  question: z.string().describe('A question derived from the document content.'),
  answer: z.string().describe('The corresponding answer to the question.'),
});

const FlashcardOutputSchema = z.object({
  flashcards: z.array(FlashcardSchema).describe('An array of question and answer flashcards.'),
});
export type FlashcardOutput = z.infer<typeof FlashcardOutputSchema>;

const flashcardPrompt = ai.definePrompt({
  name: 'flashcardPrompt',
  input: { schema: FlashcardInputSchema },
  output: { schema: FlashcardOutputSchema },
  prompt: `You are an expert at creating training materials. Your task is to analyze the provided document and generate a list of question-and-answer flashcards based on its content.

  The questions should be clear and concise, covering key information, procedures, and concepts from the document. The answers should be accurate and directly supported by the text.

  Analyze the following document:
  {{media url=documentDataUri}}

  Generate a response that is a valid JSON object conforming to the output schema.
  `,
});

export const generateFlashcardsFlow = ai.defineFlow(
  {
    name: 'generateFlashcardsFlow',
    inputSchema: FlashcardInputSchema,
    outputSchema: z.union([FlashcardOutputSchema, z.object({ error: z.string() })]),
  },
  async (input) => {
    const { output, usage } = await flashcardPrompt(input);
    if (!output) {
      return { error: 'The model did not return any output.' };
    }
    return output;
  }
);
