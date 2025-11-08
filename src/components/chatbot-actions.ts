'use server';

import { smartAiServiceChatbot } from '@/ai/flows/smart-ai-service-chatbot';

export async function getChatbotResponse(query: string) {
  try {
    const result = await smartAiServiceChatbot({ query });
    return result.response;
  } catch (error) {
    console.error("Chatbot error:", error);
    return "I'm sorry, I'm having trouble connecting right now. Please try again later.";
  }
}
