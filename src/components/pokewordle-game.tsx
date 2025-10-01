"use client";

import { useState, useEffect, useTransition, useOptimistic } from "react";
import type { ValidatePokemonGuessOutput } from "@/ai/flows/validate-pokemon-guess";
import { submitGuessAction } from "@/app/actions";
import { GuessInput } from "./guess-input";
import { GuessGrid } from "./guess-grid";
import { InstructionsModal } from "./instructions-modal";
import { ResultsModal } from "./results-modal";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import type { Pokemon } from "@/lib/pokemon";

type GameStatus = "playing" | "won";
type GameState = {
  guesses: string[];
  feedback: ValidatePokemonGuessOutput[];
  status: GameStatus;
  correctPokemon: string;
};

interface PokewordleGameProps {
  correctPokemon: string;
  pokemonList: Pokemon[];
  pokemonNameList: string[];
}

export function PokewordleGame({ correctPokemon, pokemonList, pokemonNameList }: PokewordleGameProps) {
  const [state, setState] = useState<GameState>({
    guesses: [],
    feedback: [],
    status: "playing",
    correctPokemon: correctPokemon,
  });
  const [optimisticState, addOptimisticGuess] = useOptimistic(
    state,
    (currentState, { guess, feedback }: { guess: string; feedback: ValidatePokemonGuessOutput | null }) => {
      const newGuesses = [...currentState.guesses, guess];
      const newFeedback = [...currentState.feedback, feedback as ValidatePokemonGuessOutput];
      return {
        ...currentState,
        guesses: newGuesses,
        feedback: newFeedback,
      };
    }
  );

  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    const storedStateRaw = localStorage.getItem(`pokewordle-state`);
    if (storedStateRaw) {
      try {
        const storedState: GameState = JSON.parse(storedStateRaw);
        if (storedState.correctPokemon === correctPokemon) {
          setState(storedState);
        } else {
          localStorage.removeItem('pokewordle-state');
        }
      } catch (error) {
        localStorage.removeItem(`pokewordle-state`);
      }
    }
  }, [correctPokemon]);

  useEffect(() => {
    if (state.guesses.length > 0 || state.status !== 'playing') {
      localStorage.setItem(`pokewordle-state`, JSON.stringify(state));
    }
  }, [state]);
  
  const handleReset = () => {
    const newState = {
      guesses: [],
      feedback: [],
      status: "playing" as GameStatus,
      correctPokemon: correctPokemon,
    };
    setState(newState);
    localStorage.removeItem('pokewordle-state');
    toast({
      title: "Juego reiniciado",
      description: "¡Tus intentos han sido borrados! Puedes empezar de nuevo.",
    });
  };

  const handleGuess = (guess: string) => {
    if (state.status !== "playing") return;

    if (!pokemonNameList.find(p => p.toLowerCase() === guess.toLowerCase())) {
      toast({
        title: "Pokémon no válido",
        description: `"${guess}" no está en la lista de Pokémon.`,
        variant: "destructive",
      });
      return;
    }
    
    if (state.guesses.find(g => g.toLowerCase() === guess.toLowerCase())) {
        toast({
          title: "Ya lo intentaste",
          description: `Ya has intentado con "${guess}".`,
          variant: "destructive",
        });
        return;
      }

    startTransition(async () => {
      // Optimistically add the guess with null feedback
      addOptimisticGuess({ guess, feedback: null });

      const result = await submitGuessAction(guess, correctPokemon);
      
      setState((currentState) => {
        const newGuesses = [...currentState.guesses, guess];
        let newFeedback;
        let newStatus = currentState.status;

        if ('error' in result) {
          toast({ title: 'Error', description: result.error, variant: 'destructive' });
          // If there was an error, we don't add feedback.
          // The optimistic UI will be reverted.
          return {
            ...currentState,
            guesses: currentState.guesses, // Revert guesses
            feedback: currentState.feedback, // Revert feedback
          }
        } else {
          newFeedback = [...currentState.feedback, result];
          const isCorrect = guess.toLowerCase() === correctPokemon.toLowerCase();
          if (isCorrect) {
            newStatus = "won";
          }
        }
        
        return {
          ...currentState,
          guesses: newGuesses,
          feedback: newFeedback,
          status: newStatus,
        };
      });
    });
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="icon" onClick={handleReset} aria-label="Reiniciar juego">
          <RefreshCw className="h-6 w-6" />
        </Button>
        <InstructionsModal />
      </div>
      <GuessGrid guesses={optimisticState.guesses} feedback={optimisticState.feedback} />
      {state.status === "playing" && (
        <GuessInput
          pokemonList={pokemonList}
          onSubmit={handleGuess}
          disabled={isPending}
        />
      )}
      <ResultsModal
        status={state.status}
        guesses={state.guesses}
        feedback={state.feedback}
        correctPokemon={correctPokemon}
        isOpen={state.status !== "playing"}
        onClose={() => setState(s => ({...s, status: "playing" }))}
      />
    </div>
  );
}