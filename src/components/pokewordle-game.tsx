
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

type GameStatus = "playing" | "won" | "lost";

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
  correctPokemon: Pokemon;
};

interface PokewordleGameProps {
  correctPokemon: Pokemon;
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
  const [stats, setStats] = useState<Stats>({ gamesPlayed: 0, wins: 0, currentStreak: 0, maxStreak: 0 });
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
    const storedStateRaw = localStorage.getItem(`pokewordle-state-${correctPokemon.name}`);
    if (storedStateRaw) {
      try {
        const storedState: Omit<GameState, 'correctPokemon'> & { correctPokemonName: string } = JSON.parse(storedStateRaw);
        if (storedState.correctPokemonName === correctPokemon.name) {
          const newState = { ...storedState, correctPokemon, guesses: storedState.guesses, feedback: storedState.feedback };
          setState(newState);
          if (newState.status !== "playing") {
            setResultsModalOpen(true);
          }
        } else {
          // New day, new pokemon, reset state
          handleReset(false);
        }
      } catch (error) {
        // Corrupted state, reset
        handleReset(false);
      }
    } else {
      handleReset(false); // Reset if no state for this pokemon
    }
  
    const storedStatsRaw = localStorage.getItem('pokewordle-stats');
    if (storedStatsRaw) {
      setStats(JSON.parse(storedStatsRaw));
    }
  }, [correctPokemon]);

  useEffect(() => {
    if (state.guesses.length > 0 || state.status !== 'playing') {
      const stateToStore = {
        guesses: state.guesses,
        feedback: state.feedback,
        status: state.status,
        correctPokemonName: state.correctPokemon.name,
      };
      localStorage.setItem(`pokewordle-state-${correctPokemon.name}`, JSON.stringify(stateToStore));
    }
    localStorage.setItem('pokewordle-stats', JSON.stringify(stats));
  }, [state, stats]);
  
  const handleReset = (showToast = true) => {
    const newState = {
      guesses: [],
      feedback: [],
      status: "playing" as GameStatus,
      correctPokemon: correctPokemon,
    };
    setState(newState);
    localStorage.removeItem(`pokewordle-state-${correctPokemon.name}`);
    if (showToast) {
      toast({
        title: "Juego reiniciado",
        description: "¡Tus intentos han sido borrados! Puedes empezar de nuevo.",
      });
    }
  };

  const handleGameEnd = (status: "won" | "lost") => {
    const didWin = status === 'won';
    
    // Only update stats on the first time the game ends for this session
    if (state.status === "playing") {
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
    }
    
    setState(prev => ({...prev, status}));
    setResultsModalOpen(true);
  };


  const handleGuess = (guess: string) => {
    if (state.status !== "playing") return;

    if (!pokemonNameList.find(p => p.toLowerCase() === guess.toLowerCase())) {
      toast({
        title: "Pokémon no válido",
        description: `"${guess}" no está en la lista de Pokémon para las generaciones seleccionadas.`,
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

      const result = await submitGuessAction(guess, correctPokemon.name);
      
      if ('error' in result) {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
        // On error, revert the optimistic update by resetting to the last known good state
        setState(current => ({ ...current })); 
      } else {
        const isCorrect = guess.toLowerCase() === correctPokemon.name.toLowerCase();

        setState((currentState) => {
          const guessIndex = currentState.guesses.length;
          const newGuesses = [...currentState.guesses, guess];
          const newFeedback = [...currentState.feedback, result];
          
          return {
            ...currentState,
            guesses: newGuesses,
            feedback: newFeedback,
          };
        });

        if (isCorrect) {
          handleGameEnd("won");
        }
      }
    });
  };

  // Determine the correct state to display, prioritizing optimistic state while loading
  const displayState = isPending ? optimisticState : state;

  return (
    <div className="w-full space-y-6">
      <div className="flex justify-between items-center gap-2">
        <div className="font-headline text-lg text-white">
          Adivina el Pokémon de hoy. ¡Intentos ilimitados!
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => handleReset()} aria-label="Reiniciar juego">
            <RefreshCw className="h-6 w-6 text-white" />
          </Button>
          <InstructionsModal />
        </div>
      </div>
      
      <GuessGrid guesses={displayState.guesses} feedback={displayState.feedback} />
      
      {state.status === "playing" && (
        <GuessInput
          pokemonList={pokemonList}
          onSubmit={handleGuess}
          disabled={isPending}
        />
      )}

      {state.status !== "playing" && (
         <Button onClick={() => setResultsModalOpen(true)} className="w-full bg-accent hover:bg-accent/90">
            Mostrar Resultados
          </Button>
      )}

      <ResultsModal
        status={state.status}
        guesses={state.guesses}
        feedback={state.feedback as ValidatePokemonGuessOutput[]}
        correctPokemon={correctPokemon.name}
        stats={stats}
        isOpen={isResultsModalOpen}
        onClose={() => setResultsModalOpen(false)}
      />
    </div>
  );
}

