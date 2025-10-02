import { getDailyPokemon, getYesterdaysPokemon } from '@/lib/daily-pokemon';
import { POKEMON_LIST, POKEMON_NAME_LIST } from '@/lib/pokemon';
import { PokewordleGame } from '@/components/pokewordle-game';
import type { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Pokewordle: Adivina el Pokémon Diario',
  description:
    '¿Fan de Pokémon y Wordle? Juega Pokewordle, el desafío diario para adivinar criaturas con pistas de tipo, generación y estadísticas. ¡Juega gratis!',
  keywords: 'Pokewordle, Pokémon Wordle, Adivina el Pokémon, Juego Pokémon diario, Reto Pokémon',
};

export default function Home() {
  const correctPokemonName = getDailyPokemon();
  const correctPokemon = POKEMON_LIST.find(p => p.name === correctPokemonName);
  const yesterdaysPokemon = getYesterdaysPokemon();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-transparent p-4 text-foreground">
      <Image
        src="https://i.imgur.com/lZ7s35n.jpeg"
        alt="Pokemon landscape background"
        fill
        className="object-cover -z-10"
        data-ai-hint="pokemon landscape"
      />
      <div className="absolute inset-0 bg-black/50 -z-10" />
      <div className="w-full max-w-4xl bg-card/50 backdrop-blur-sm rounded-lg p-4">
        <header className="py-8 text-center">
          <h1 className="font-headline text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
            Pokewordle Diario
          </h1>
          <p className="mt-4 text-lg text-white sm:text-xl">
            El Pokémon de ayer fue: <span className="font-bold text-white">{yesterdaysPokemon}</span>
          </p>
        </header>

        <main>
          <PokewordleGame 
            correctPokemon={correctPokemon!} 
            pokemonList={POKEMON_LIST} 
            pokemonNameList={POKEMON_NAME_LIST} 
          />
        </main>
      </div>
      <footer className="w-full p-8 text-center text-neutral-300">
        <p>&copy; {new Date().getFullYear()} Pokewordle. ¡Vuelve mañana por un nuevo desafío!</p>
      </footer>
    </div>
  );
}
