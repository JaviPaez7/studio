"use client";

import type { ValidatePokemonGuessOutput } from "@/ai/flows/validate-pokemon-guess";
import { cn } from "@/lib/utils";
import { Shield, Hash, Ruler, Scale } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface GuessGridProps {
  guesses: string[];
  feedback: ValidatePokemonGuessOutput[];
}

const feedbackColorMap = {
  green: "bg-green-500",
  yellow: "bg-yellow-400",
  gray: "bg-neutral-300 dark:bg-neutral-600",
};

const headers = [
  { label: "Pokémon", icon: null },
  { label: "Tipo", icon: Shield },
  { label: "Generación", icon: Hash },
  { label: "Altura", icon: Ruler },
  { label: "Peso", icon: Scale },
];

export function GuessGrid({ guesses, feedback }: GuessGridProps) {
  const emptyRows = Array(6 - guesses.length).fill(null);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="grid grid-cols-5 gap-2 px-2 pb-2 border-b">
            {headers.map((header, i) => (
              <div key={i} className="flex items-center justify-center gap-2 font-headline text-sm font-bold text-center">
                {header.icon && <header.icon className="h-4 w-4 text-muted-foreground" />}
                <span>{header.label}</span>
              </div>
            ))}
          </div>

          {guesses.map((guess, index) => (
            <div key={index} className="grid grid-cols-5 gap-2 animate-in fade-in-50">
              <div className="flex items-center justify-center h-12 rounded-md bg-muted font-semibold text-center p-2">
                {guess}
              </div>
              {feedback[index] && Object.values(feedback[index]).map((fb, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-12 w-full rounded-md",
                    feedbackColorMap[fb as keyof typeof feedbackColorMap]
                  )}
                />
              ))}
            </div>
          ))}

          {emptyRows.map((_, index) => (
            <div key={index} className="grid grid-cols-5 gap-2">
              <div className="h-12 w-full rounded-md bg-secondary/50" />
              <div className="h-12 w-full rounded-md bg-secondary/50" />
              <div className="h-12 w-full rounded-md bg-secondary/50" />
              <div className="h-12 w-full rounded-md bg-secondary/50" />
              <div className="h-12 w-full rounded-md bg-secondary/50" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
