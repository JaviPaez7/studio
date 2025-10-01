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
  typeFeedback: z.enum(['green', 'yellow', 'gray']).describe('Feedback for the Pokémon primary type.'),
  secondaryTypeFeedback: z.enum(['green', 'yellow', 'gray']).describe('Feedback for the Pokémon secondary type. Gray if it does not have one.'),
  heightFeedback: z.enum(['green', 'yellow', 'gray']).describe('Feedback for the Pokémon height.'),
  weightFeedback: z.enum(['green', 'yellow', 'gray']).describe('Feedback for the Pokémon weight.'),
  guessedPokemon: z.object({
    type: z.string().describe("The primary type of the guessed Pokémon."),
    secondaryType: z.string().describe("The secondary type of the guessed Pokémon. 'N/A' if it does not have one."),
    height: z.string().describe("The height of the guessed Pokémon in meters (e.g., '0.7m')."),
    weight: z.string().describe("The weight of the guessed Pokémon in kilograms (e.g., '6.9kg')."),
  }).describe("The stats of the guessed Pokémon."),
});
export type ValidatePokemonGuessOutput = z.infer<typeof ValidatePokemonGuessOutputSchema>;

export async function validatePokemonGuess(input: ValidatePokemonGuessInput): Promise<ValidatePokemonGuessOutput> {
  return validatePokemonGuessFlow(input);
}

const prompt = ai.definePrompt({
  name: 'validatePokemonGuessPrompt',
  input: {schema: ValidatePokemonGuessInputSchema},
  output: {schema: ValidatePokemonGuessOutputSchema},
  prompt: `You are an expert Pokémon evaluator. Given a guess and the correct Pokémon, you will provide feedback on the guess and the stats of the guessed pokemon.

Here's how the feedback works:

*   If the guess's primary type matches the correct Pokémon's primary type, return \"green\".
*   If the guess's primary type is the correct Pokémon's secondary type, return \"yellow\".
*   Otherwise, return \"gray\".

*   For the secondary type, if the guessed pokemon has a secondary type, compare it to the correct Pokémon's types.
*   If the secondary type matches the correct Pokémon's secondary type (or primary if it matches), return \"green\".
*   If the secondary type matches the correct Pokémon's primary type, return \"yellow\".
*   If the correct pokemon has no secondary type and the guessed one has, return "gray".
*   If both pokemon don't have a secondary type, return "green".
*   Otherwise, return \"gray\".

*   If the guess's height matches the correct Pokémon's height, return \"green\".
*   If the guess's height is close to the correct Pokémon's height (within 20% of the correct value), return \"yellow\".
*   Otherwise, return \"gray\".

*   If the guess's weight matches the correct Pokémon's weight, return \"green\".
*   If the guess's weight is close to the correct Pokémon's weight (within 20% of the correct value), return \"yellow\".
*   Otherwise, return \"gray\".

Here is the guess: {{{guess}}}
Here is the correct Pokémon: {{{correctPokemon}}}

Return a JSON object with the typeFeedback, secondaryTypeFeedback, heightFeedback, weightFeedback, and the guessedPokemon object containing the guessed Pokémon's type, secondary type, height, and weight. If a Pokémon does not have a secondary type, the value should be 'N/A'.`,
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
