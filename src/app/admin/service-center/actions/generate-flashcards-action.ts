
'use server';

import { generateFlashcardsFlow } from '@/ai/flows/generate-flashcards-flow';

type Input = {
  documentDataUri: string;
};

export async function generateFlashcards(input: Input) {
  try {
    const result = await generateFlashcardsFlow(input);
    return result;
  } catch (error) {
    console.error("Agent response generation action error:", error);
    return {
        error: "I'm sorry, I'm having trouble generating agent responses right now. The document might be too complex or in an unsupported format."
    };
  }
}
