
import { getPokemonNameList } from './pokemon';

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

export function getDailyPokemon(salt: string = '', generations: number = 3): string {
  const pokemonNameList = getPokemonNameList(generations);
  const today = new Date();
  const dateString = today.toDateString(); // e.g., "Mon Jul 29 2024"
  const seed = simpleHash(dateString + salt + String(generations));
  const index = Math.abs(seed) % pokemonNameList.length;
  return pokemonNameList[index];
}

export function getYesterdaysPokemon(salt: string = '', generations: number = 3): string {
  const pokemonNameList = getPokemonNameList(generations);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const dateString = yesterday.toDateString();
  const seed = simpleHash(dateString + salt + String(generations));
  const index = Math.abs(seed) % pokemonNameList.length;
  return pokemonNameList[index];
}
