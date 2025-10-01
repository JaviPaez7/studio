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
  habitatFeedback: z.enum(['green', 'gray']).describe('Feedback for the Pokémon habitat.'),
  evolutionStageFeedback: z.enum(['green', 'gray']).describe('Feedback for the Pokémon evolutionary stage.'),
  heightFeedback: z.enum(['green', 'yellow', 'gray']).describe('Feedback for the Pokémon height.'),
  weightFeedback: z.enum(['green', 'yellow', 'gray']).describe('Feedback for the Pokémon weight.'),
  guessedPokemon: z.object({
    name: z.string().describe("The name of the guessed Pokémon."),
    photoUrl: z.string().url().describe("The URL for the guessed Pokémon's sprite image."),
    type: z.string().describe("The primary type of the guessed Pokémon."),
    secondaryType: z.string().describe("The secondary type of the guessed Pokémon. 'N/A' if it does not have one."),
    habitat: z.string().describe("The habitat of the guessed Pokémon."),
    evolutionStage: z.string().describe("The evolutionary stage of the guessed Pokémon (e.g., 'Stage 1', 'Stage 2')."),
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
You must fetch the Pokémon data and provide a photoUrl using the official sprite from this URL format: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/{pokedex_number}.png'.

Here's how the feedback works:

*   **Primary Type**:
    *   "green" if the guess's primary type matches the correct Pokémon's primary type.
    *   "yellow" if the guess's primary type is the correct Pokémon's secondary type.
    *   "gray" otherwise.

*   **Secondary Type**:
    *   "green" if the guess's secondary type matches the correct Pokémon's secondary type.
    *   "yellow" if the guess's secondary type matches the correct Pokémon's primary type.
    *   "green" if both Pokémon lack a secondary type.
    *   "gray" otherwise.

*   **Habitat**:
    *   "green" if the habitat matches.
    *   "gray" otherwise.

*   **Evolutionary Stage**:
    *   "green" if the evolutionary stage matches.
    *   "gray" otherwise.

*   **Height**:
    *   "green" if the height is an exact match.
    *   "yellow" if the height is within 20% of the correct value.
    *   "gray" otherwise.

*   **Weight**:
    *   "green" if the weight is an exact match.
    *   "yellow" if the weight is within 20% of the correct value.
    *   "gray" otherwise.

Here is the guess: {{{guess}}}
Here is the correct Pokémon: {{{correctPokemon}}}

Return a JSON object with all the feedback fields and the guessedPokemon object containing all of its stats. If a Pokémon does not have a secondary type, the value should be 'N/A'.`,
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
