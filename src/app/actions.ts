"use server";

import { validatePokemonGuess, type ValidatePokemonGuessOutput } from '@/ai/flows/validate-pokemon-guess';

export async function submitGuessAction(
  guess: string,
  correctPokemon: string
): Promise<ValidatePokemonGuessOutput | { error: string }> {
  try {
    // For now, we'll hardcode Spanish. Later we can pass the active locale.
    const feedback = await validatePokemonGuess({ guess, correctPokemon, language: 'es' });
    return feedback;
  } catch (error) {
    console.error("Error in submitGuessAction:", error);
    return { error: "Failed to get feedback from AI. Please try again." };
  }
}
