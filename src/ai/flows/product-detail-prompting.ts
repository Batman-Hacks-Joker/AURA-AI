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
  productName: z.string().describe('The suggested name of the product.'),
  productFeatures: z.array(z.string()).describe('A list of key features for the product.'),
  productBenefits: z.array(z.string()).describe('A list of benefits the product provides to the customer.'),
  productPrice: z.number().describe('The suggested retail price for the product.'),
  productCategory: z.string().describe('The category the product belongs to'),
});
export type ProductDetailsOutput = z.infer<typeof ProductDetailsOutputSchema>;

export async function generateProductDetails(input: ProductDescriptionInput): Promise<ProductDetailsOutput> {
  return productDetailPromptingFlow(input);
}

const productDetailPrompt = ai.definePrompt({
  name: 'productDetailPrompt',
  input: {schema: ProductDescriptionInputSchema},
  output: {schema: ProductDetailsOutputSchema},
  prompt: `You are an expert product description writer for e-commerce.
  Based on the following general product description, generate compelling product details to attract customers.

  Product Description: {{{productDescription}}}

  Consider the product name, key features, customer benefits, a suitable price point, and product category.
  Format the response as a JSON object conforming to the ProductDetailsOutputSchema schema.
  Use the descriptions provided in the schema to guide the content of each field.`,
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
