'use server';

import { generateProductDetails } from '@/ai/flows/product-detail-prompting';

// A simple in-memory store for the generated product details.
// In a real app, you would save this to a database.
let productDetailsStore: any = null;

export async function getProductCreationResponse(productDescription: string, conversationHistory: string) {
  try {
    const result = await generateProductDetails({ productDescription });
    
    // Store the generated details
    productDetailsStore = result;

    // Create a conversational response based on the structured data
    const responseLines = [
      `Great! I've generated some initial details for your new product, the **${result.productName}**.`,
      `I've categorized it under **${result.productCategory}** and set a price of **$${result.productPrice}**.`,
      "\nHere are some key features I've highlighted:",
      ...result.productFeatures.map(f => `- ${f}`),
      "\nAnd the customer benefits:",
      ...result.productBenefits.map(b => `- ${b}`),
      "\nHow does this look? We can refine any of these details. Just let me know what you'd like to change."
    ];
    
    return responseLines.join('\n');

  } catch (error) {
    console.error("Product creation bot error:", error);
    return "I'm sorry, I'm having trouble generating product details right now. Could you tell me a little more about the product?";
  }
}

export async function getGeneratedProductDetails() {
    return productDetailsStore;
}
