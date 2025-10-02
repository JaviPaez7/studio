import { getDailyPokemon } from '@/lib/daily-pokemon';
import { POKEMON_LIST, POKEMON_NAME_LIST } from '@/lib/pokemon';
import { SilhouetteGame } from '@/components/silhouette-game';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Pokewordle: ¿Quién es ese Pokémon?',
  description: 'Adivina el Pokémon a partir de su silueta. ¡Un desafío diario para verdaderos fans!',
  keywords: 'Pokewordle, Quién es ese Pokémon, Silueta Pokémon, Adivina el Pokémon, Juego Pokémon diario',
};

export default function SilhouettePage() {
  const correctPokemonName = getDailyPokemon();
  const correctPokemon = POKEMON_LIST.find(p => p.name === correctPokemonName);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-transparent p-4 text-foreground">
      <Image
        src="https://i.imgur.com/gYhYw1F.jpeg"
        alt="Pokemon forest background"
        fill
        className="object-cover -z-10"
        data-ai-hint="pokemon forest"
      />
      <div className="absolute inset-0 bg-black/50 -z-10" />
      <div className="w-full max-w-md bg-card/50 backdrop-blur-sm rounded-lg p-4">
        <header className="py-8 text-center">
          <h1 className="font-headline text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
            ¿Quién es ese Pokémon?
          </h1>
          <p className="mt-4 text-lg text-white sm:text-xl">
            Adivina el Pokémon misterioso por su silueta.
          </p>
        </header>

        <main>
          <SilhouetteGame 
            correctPokemon={correctPokemon!} 
            pokemonList={POKEMON_LIST}
          />
        </main>

        <div className="text-center mt-8">
            <Button asChild variant="secondary">
                <Link href="/">← Volver al modo Clásico</Link>
            </Button>
        </div>
      </div>
      <footer className="w-full p-8 text-center text-neutral-300">
        <p>&copy; {new Date().getFullYear()} Pokewordle. ¡Vuelve mañana por un nuevo desafío!</p>
      </footer>
    </div>
  );
}
