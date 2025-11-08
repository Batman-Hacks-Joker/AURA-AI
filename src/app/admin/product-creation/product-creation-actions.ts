'use server';

import { generateProductDetails } from '@/ai/flows/product-detail-prompting';

export async function getProductCreationResponse(productDescription: string, conversationHistory: string) {
  try {
    const result = await generateProductDetails({ productDescription });
    return result;

  } catch (error) {
    console.error("Product creation bot error:", error);
    // In case of an API error, we can return a structured error object.
    return {
        error: "I'm sorry, I'm having trouble generating product details right now. Could you tell me a little more about the product?"
    };
  }
}
