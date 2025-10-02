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
type Stats = {
  gamesPlayed: number;
  wins: number;
  currentStreak: number;
  maxStreak: number;
};
type GameState = {
  guesses: string[];
  feedback: (ValidatePokemonGuessOutput | null)[];
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
   const [stats, setStats] = useState<Stats>({
    gamesPlayed: 0,
    wins: 0,
    currentStreak: 0,
    maxStreak: 0,
  });
   const [isResultsModalOpen, setResultsModalOpen] = useState(false);

  const [optimisticState, addOptimisticGuess] = useOptimistic(
    state,
    (currentState, { guess, feedback }: { guess: string; feedback: ValidatePokemonGuessOutput | null }) => {
      const newGuesses = [...currentState.guesses, guess];
      const newFeedback = [...currentState.feedback, feedback];
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
    const storedStatsRaw = localStorage.getItem('pokewordle-stats');
    if (storedStatsRaw) {
      setStats(JSON.parse(storedStatsRaw));
    }

    const storedStateRaw = localStorage.getItem(`pokewordle-state`);
    if (storedStateRaw) {
      try {
        const storedState: GameState = JSON.parse(storedStateRaw);
        if (storedState.correctPokemon === correctPokemon) {
          setState(storedState);
           if (storedState.status !== "playing") {
            setResultsModalOpen(true);
          }
        } else {
          // New day, new pokemon, reset state but not stats
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

  useEffect(() => {
    localStorage.setItem('pokewordle-stats', JSON.stringify(stats));
  }, [stats]);
  
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

  const handleGameEnd = (didWin: boolean) => {
    setResultsModalOpen(true);
    setStats(prevStats => {
      const newGamesPlayed = prevStats.gamesPlayed + 1;
      const newWins = didWin ? prevStats.wins + 1 : prevStats.wins;
      const newCurrentStreak = didWin ? prevStats.currentStreak + 1 : 0;
      const newMaxStreak = Math.max(prevStats.maxStreak, newCurrentStreak);

      return {
        gamesPlayed: newGamesPlayed,
        wins: newWins,
        currentStreak: newCurrentStreak,
        maxStreak: newMaxStreak,
      };
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
      addOptimisticGuess({ guess, feedback: null });

      const result = await submitGuessAction(guess, correctPokemon);
      
      setState((currentState) => {
        let newStatus: GameStatus = currentState.status;
        let finalFeedback;
        let finalGuesses;

        if ('error' in result) {
          toast({ title: 'Error', description: result.error, variant: 'destructive' });
          // If there was an error, we revert the optimistic update by returning the old state.
          // But we need to filter out the optimistic guess.
          finalGuesses = currentState.guesses.filter(g => g !== guess);
          finalFeedback = currentState.feedback; // This assumes feedback was null and can be kept
        } else {
          finalFeedback = [...currentState.feedback, result];
          finalGuesses = [...currentState.guesses, guess];
          const isCorrect = guess.toLowerCase() === correctPokemon.toLowerCase();
          if (isCorrect) {
            newStatus = "won";
            handleGameEnd(true);
          }
        }
        
        return {
          ...currentState,
          guesses: finalGuesses,
          feedback: finalFeedback,
          status: newStatus,
        };
      });
    });
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex justify-end items-center gap-2">
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
        stats={stats}
        guesses={state.guesses}
        feedback={state.feedback as ValidatePokemonGuessOutput[]}
        correctPokemon={correctPokemon}
        isOpen={isResultsModalOpen}
        onClose={() => setResultsModalOpen(false)}
      />
    </div>
  );
}
