
'use server';

import { generateProductDetails } from '@/ai/flows/product-detail-prompting';
import { generateImage } from '@/ai/flows/generate-image-flow';

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

export async function getGeneratedImage(prompt: string) {
    try {
        const result = await generateImage({ prompt });
        return result;
    } catch (error) {
        console.error("Image generation error:", error);
        return {
            error: "I'm sorry, I couldn't generate an image right now. Please try a different prompt or upload an image instead."
        };
    }
}
