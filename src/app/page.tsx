
'use client';

import { useState, useEffect } from 'react';
import { getDailyPokemon, getYesterdaysPokemon } from '@/lib/daily-pokemon';
import { POKEMON_LIST_ALL, getPokemonList, POKEMON_NAME_LIST_ALL, getPokemonNameList } from '@/lib/pokemon';
import { PokewordleGame } from '@/components/pokewordle-game';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function Home() {
  const [generations, setGenerations] = useState(3);
  const [pokemonList, setPokemonList] = useState(POKEMON_LIST_ALL);
  const [pokemonNameList, setPokemonNameList] = useState(POKEMON_NAME_LIST_ALL);
  const [correctPokemonName, setCorrectPokemonName] = useState('');
  const [yesterdaysPokemon, setYesterdaysPokemon] = useState('');

  useEffect(() => {
    const storedGenerations = localStorage.getItem('pokewordle-generations');
    const initialGenerations = storedGenerations ? parseInt(storedGenerations, 10) : 3;
    handleGenerationChange(String(initialGenerations));
  }, []);
  
  const handleGenerationChange = (value: string) => {
    const gen = parseInt(value, 10);
    setGenerations(gen);
    localStorage.setItem('pokewordle-generations', String(gen));
    
    const newList = getPokemonList(gen);
    const newNameList = getPokemonNameList(gen);
    setPokemonList(newList);
    setPokemonNameList(newNameList);
    
    setCorrectPokemonName(getDailyPokemon('classic', gen));
    setYesterdaysPokemon(getYesterdaysPokemon('classic', gen));
  };
  
  const correctPokemon = pokemonList.find(p => p.name === correctPokemonName);

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
          {correctPokemon ? (
            <PokewordleGame 
              key={correctPokemon.name}
              correctPokemon={correctPokemon} 
              pokemonList={pokemonList} 
              pokemonNameList={pokemonNameList} 
            />
          ) : (
            <div className="text-center text-white">Cargando Pokémon...</div>
          )}
        </main>
        
        <div className="w-full max-w-xs mx-auto space-y-2 mt-8">
            <Label htmlFor="generations" className="text-white">Generaciones</Label>
            <Select onValueChange={handleGenerationChange} defaultValue={String(generations)}>
                <SelectTrigger id="generations">
                    <SelectValue placeholder="Seleccionar generaciones" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="1">Gen 1 (151 Pokémon)</SelectItem>
                    <SelectItem value="2">Gen 1-2 (251 Pokémon)</SelectItem>
                    <SelectItem value="3">Gen 1-3 (386 Pokémon)</SelectItem>
                </SelectContent>
            </Select>
        </div>


        <div className="text-center mt-8">
            <Button asChild variant="secondary">
                <Link href="/silhouette">Jugar al modo Silueta →</Link>
            </Button>
        </div>
      </div>
      <footer className="w-full p-8 text-center text-neutral-300">
        <p>&copy; {new Date().getFullYear()} Pokewordle. ¡Vuelve mañana por un nuevo desafío!</p>
      </footer>
    </div>
  );
}

