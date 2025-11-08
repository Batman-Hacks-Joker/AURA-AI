'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating product details based on a product description.
 *
 * The flow takes a product description as input and returns suggested product details.
 * @param {ProductDescriptionInput} input - The input data containing the product description.
 * @returns {Promise<ProductDetailsOutput>} - A promise that resolves to the generated product details.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProductDescriptionInputSchema = z.object({
  productDescription: z
    .string()
    .describe('A general description of the product for which details are to be generated.'),
});
export type ProductDescriptionInput = z.infer<typeof ProductDescriptionInputSchema>;

const ProductDetailsOutputSchema = z.object({
  productName: z.string().describe('A creative and marketable name for the product.'),
  productFeatures: z.array(z.string()).describe('A list of 3-5 key technical features or specifications.'),
  productBenefits: z.array(z.string()).describe('A list of 3-5 key benefits that explain how the features help the customer.'),
  productPrice: z.number().describe('A suggested retail price, as a number.'),
  productCategory: z.string().describe('The most appropriate e-commerce category for the product (e.g., Electronics, Home Goods, Automotive).'),
});
export type ProductDetailsOutput = z.infer<typeof ProductDetailsOutputSchema>;

export async function generateProductDetails(input: ProductDescriptionInput): Promise<ProductDetailsOutput> {
  return productDetailPromptingFlow(input);
}

const productDetailPrompt = ai.definePrompt({
  name: 'productDetailPrompt',
  input: {schema: ProductDescriptionInputSchema},
  output: {schema: ProductDetailsOutputSchema},
  prompt: `You are an expert product marketing and e-commerce launch specialist. Your task is to take a simple product description from a user and transform it into a compelling product listing.

  Based on the following product description, generate a creative product name, 3-5 key features, 3-5 key customer benefits, a suitable price point, and an appropriate e-commerce category.

  User's Product Description: {{{productDescription}}}

  Generate a response that is a valid JSON object conforming to the output schema. Use the schema field descriptions to guide your response. For example, 'productName' should be a marketable name, not just a description. 'productFeatures' should be technical, while 'productBenefits' should be customer-centric.
  `,
});

const productDetailPromptingFlow = ai.defineFlow(
  {
    name: 'productDetailPromptingFlow',
    inputSchema: ProductDescriptionInputSchema,
    outputSchema: ProductDetailsOutputSchema,
  },
  async input => {
    const {output} = await productDetailPrompt(input);
    return output!;
  }
);
