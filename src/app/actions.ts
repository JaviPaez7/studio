"use server";

import { validatePokemonGuess, type ValidatePokemonGuessOutput } from '@/ai/flows/validate-pokemon-guess';

export async function submitGuessAction(
  guess: string,
  correctPokemon: string
): Promise<ValidatePokemonGuessOutput | { error: string }> {
  try {
    const feedback = await validatePokemonGuess({ guess, correctPokemon });
    return feedback;
  } catch (error) {
    console.error("Error in submitGuessAction:", error);
    return { error: "Failed to get feedback from AI. Please try again." };
  }
}
