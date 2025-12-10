'use server';

/**
 * @fileOverview Generates a descriptive name and short description for a custom snack bouquet based on its contents and theme.
 *
 * - generateBouquetDescription - A function that generates the bouquet description.
 * - GenerateBouquetDescriptionInput - The input type for the generateBouquetDescription function.
 * - GenerateBouquetDescriptionOutput - The return type for the generateBouquetDescription function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateBouquetDescriptionInputSchema = z.object({
  items: z
    .array(z.string())
    .describe('List of items included in the custom bouquet.'),
  theme: z.string().describe('The theme or occasion for the bouquet.'),
});
export type GenerateBouquetDescriptionInput = z.infer<
  typeof GenerateBouquetDescriptionInputSchema
>;

const GenerateBouquetDescriptionOutputSchema = z.object({
  name: z.string().describe('A descriptive name for the bouquet.'),
  description: z.string().describe('A short description of the bouquet.'),
});
export type GenerateBouquetDescriptionOutput = z.infer<
  typeof GenerateBouquetDescriptionOutputSchema
>;

export async function generateBouquetDescription(
  input: GenerateBouquetDescriptionInput
): Promise<GenerateBouquetDescriptionOutput> {
  return generateBouquetDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBouquetDescriptionPrompt',
  input: { schema: GenerateBouquetDescriptionInputSchema },
  output: { schema: GenerateBouquetDescriptionOutputSchema },
  prompt: `You are a creative marketing expert specializing in naming and describing custom snack bouquets.

  Given the items included and the theme of the bouquet, generate a catchy name and a short, appealing description.

  Items: {{items}}
  Theme: {{theme}}

  Name: 
  Description: `,
});

const generateBouquetDescriptionFlow = ai.defineFlow(
  {
    name: 'generateBouquetDescriptionFlow',
    inputSchema: GenerateBouquetDescriptionInputSchema,
    outputSchema: GenerateBouquetDescriptionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
