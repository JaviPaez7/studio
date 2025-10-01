'use server';

/**
 * @fileOverview Flow to validate a Pokémon guess and provide color-coded feedback.
 *
 * - validatePokemonGuess - Function to validate the guess and return feedback.
 * - ValidatePokemonGuessInput - Input type for the validatePokemonGuess function.
 * - ValidatePokemonGuessOutput - Return type for the validatePokemonGuess function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ValidatePokemonGuessInputSchema = z.object({
  guess: z.string().describe('The Pokémon name guessed by the user.'),
  correctPokemon: z.string().describe('The correct Pokémon name for the day.'),
});
export type ValidatePokemonGuessInput = z.infer<typeof ValidatePokemonGuessInputSchema>;

const ValidatePokemonGuessOutputSchema = z.object({
  typeFeedback: z.enum(['green', 'yellow', 'gray']).describe('Feedback for the Pokémon type.'),
  generationFeedback: z.enum(['green', 'yellow', 'gray']).describe('Feedback for the Pokémon generation.'),
  heightFeedback: z.enum(['green', 'yellow', 'gray']).describe('Feedback for the Pokémon height.'),
  weightFeedback: z.enum(['green', 'yellow', 'gray']).describe('Feedback for the Pokémon weight.'),
});
export type ValidatePokemonGuessOutput = z.infer<typeof ValidatePokemonGuessOutputSchema>;

export async function validatePokemonGuess(input: ValidatePokemonGuessInput): Promise<ValidatePokemonGuessOutput> {
  return validatePokemonGuessFlow(input);
}

const prompt = ai.definePrompt({
  name: 'validatePokemonGuessPrompt',
  input: {schema: ValidatePokemonGuessInputSchema},
  output: {schema: ValidatePokemonGuessOutputSchema},
  prompt: `You are an expert Pokémon evaluator. Given a guess and the correct Pokémon, you will provide feedback on the guess.

Here's how the feedback works:

*   If the guess's type matches the correct Pokémon's type, return \"green\".
*   If the guess's type is a type that the correct Pokémon has, but not its primary type, return \"yellow\".
*   Otherwise, return \"gray\".

*   If the guess's generation matches the correct Pokémon's generation, return \"green\".
*   If the guess's generation is close to the correct Pokémon's generation (e.g., off by one), return \"yellow\".
*   Otherwise, return \"gray\".

*   If the guess's height matches the correct Pokémon's height, return \"green\".
*   If the guess's height is close to the correct Pokémon's height (within a reasonable range), return \"yellow\".
*   Otherwise, return \"gray\".

*   If the guess's weight matches the correct Pokémon's weight, return \"green\".
*   If the guess's weight is close to the correct Pokémon's weight (within a reasonable range), return \"yellow\".
*   Otherwise, return \"gray\".

Here is the guess: {{{guess}}}
Here is the correct Pokémon: {{{correctPokemon}}}

Return a JSON object with the typeFeedback, generationFeedback, heightFeedback, and weightFeedback.`,
});

const validatePokemonGuessFlow = ai.defineFlow(
  {
    name: 'validatePokemonGuessFlow',
    inputSchema: ValidatePokemonGuessInputSchema,
    outputSchema: ValidatePokemonGuessOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
