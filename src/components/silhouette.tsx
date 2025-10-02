"use client";

import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { Pokemon } from '@/lib/pokemon';

interface SilhouetteProps {
  pokemon: Pokemon;
  isRevealed: boolean;
}

export function Silhouette({ pokemon, isRevealed }: SilhouetteProps) {
  return (
    <div className="relative flex items-center justify-center h-48 w-48 mx-auto">
      <Image
        src={pokemon.spriteUrl}
        alt="Silueta del Pokémon misterioso"
        width={192}
        height={192}
        className={cn(
          "transition-all duration-500 ease-in-out",
          isRevealed ? 'opacity-100' : 'opacity-0'
        )}
      />
      <Image
        src={pokemon.spriteUrl}
        alt="Silueta del Pokémon misterioso"
        width={192}
        height={192}
        className={cn(
          "absolute inset-0 transition-all duration-500 ease-in-out",
          "[filter:brightness(0)_drop-shadow(0_2px_2px_rgba(0,0,0,0.5))]",
          isRevealed ? 'opacity-0 scale-110' : 'opacity-100 scale-100'
        )}
      />
    </div>
  );
}
