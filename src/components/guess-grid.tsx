"use client";

import type { ValidatePokemonGuessOutput } from "@/ai/flows/validate-pokemon-guess";
import { cn } from "@/lib/utils";
import { Shield, ShieldPlus, Ruler, Scale, Mountain, Shell, ArrowUp, ArrowDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

interface GuessGridProps {
  guesses: string[];
  feedback: ValidatePokemonGuessOutput[];
}

const feedbackColorMap = {
  green: "bg-green-500",
  yellow: "bg-yellow-400",
  red: "bg-red-500",
};

const headers = [
  { label: "Pokémon", icon: null },
  { label: "Tipo 1", icon: Shield },
  { label: "Tipo 2", icon: ShieldPlus },
  { label: "Hábitat", icon: Mountain },
  { label: "Etapa", icon: Shell },
  { label: "Altura", icon: Ruler },
  { label: "Peso", icon: Scale },
];

const feedbackKeys: (keyof Omit<ValidatePokemonGuessOutput, 'guessedPokemon' | 'heightDirection' | 'weightDirection'>)[] = [
    'typeFeedback',
    'secondaryTypeFeedback',
    'habitatFeedback',
    'evolutionStageFeedback',
    'heightFeedback',
    'weightFeedback'
];

const statKeys: (keyof Omit<ValidatePokemonGuessOutput['guessedPokemon'], 'name' | 'photoUrl'>)[] = ['type', 'secondaryType', 'habitat', 'evolutionStage', 'height', 'weight'];

export function GuessGrid({ guesses, feedback }: GuessGridProps) {
  const showEmptyState = guesses.length === 0;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="grid grid-cols-7 gap-2 px-2 pb-2 border-b">
            {headers.map((header, i) => (
              <div key={i} className="flex items-center justify-center gap-2 font-headline text-sm font-bold text-center">
                {header.icon && <header.icon className="h-4 w-4 text-muted-foreground" />}
                <span>{header.label}</span>
              </div>
            ))}
          </div>

          {guesses.map((guess, index) => {
            const currentFeedback = feedback[index];
            const guessedPokemonStats = currentFeedback?.guessedPokemon;

            return (
              <div key={index} className="grid grid-cols-7 gap-2 animate-in fade-in-50">
                <div className="flex items-center justify-start h-12 rounded-md bg-secondary/80 font-semibold text-secondary-foreground text-left p-1 gap-1">
                  {guessedPokemonStats?.photoUrl && (
                    <Image src={guessedPokemonStats.photoUrl} alt={guess} width={40} height={40} className="shrink-0" />
                  )}
                  <span className="truncate">{guess}</span>
                </div>
                {statKeys.map((key, i) => {
                  const feedbackKey = feedbackKeys[i];
                  const color = currentFeedback ? feedbackColorMap[currentFeedback[feedbackKey] as keyof typeof feedbackColorMap] : "bg-muted";

                  return (
                    <div
                      key={i}
                      className={cn(
                        "h-12 w-full rounded-md flex flex-col items-center justify-center text-center p-1 text-xs sm:text-sm font-semibold text-white",
                        color
                      )}
                    >
                      {guessedPokemonStats && (
                        <div className="flex items-center gap-1">
                          <span className="capitalize">{guessedPokemonStats[key]}</span>
                          {feedbackKey === 'heightFeedback' && currentFeedback.heightDirection === 'up' && <ArrowUp className="h-4 w-4" />}
                          {feedbackKey === 'heightFeedback' && currentFeedback.heightDirection === 'down' && <ArrowDown className="h-4 w-4" />}
                          {feedbackKey === 'weightFeedback' && currentFeedback.weightDirection === 'up' && <ArrowUp className="h-4 w-4" />}
                          {feedbackKey === 'weightFeedback' && currentFeedback.weightDirection === 'down' && <ArrowDown className="h-4 w-4" />}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )
          })}

          {showEmptyState && (
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 7 }).map((_, index) => (
                <div key={index} className="h-12 w-full rounded-md bg-secondary/50" />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
