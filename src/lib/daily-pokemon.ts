import { POKEMON_LIST } from './pokemon';

// Simple pseudo-random number generator to have a consistent "daily" pokemon
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

export function getDailyPokemon(): string {
  const today = new Date();
  const dateString = today.toDateString(); // e.g., "Mon Jul 29 2024"
  const seed = simpleHash(dateString);
  const index = Math.abs(seed) % POKEMON_LIST.length;
  return POKEMON_LIST[index];
}
