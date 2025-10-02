"use client";

import { useState, useEffect, useTransition, useOptimistic } from "react";
import type { ValidatePokemonGuessOutput } from "@/ai/flows/validate-pokemon-guess";
import { submitGuessAction } from "@/app/actions";
import { GuessInput } from "./guess-input";
import { GuessGrid } from "./guess-grid";
import { InstructionsModal } from "./instructions-modal";
import { ResultsModal } from "./results-modal";
import { Silhouette } from "./silhouette";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import type { Pokemon } from "@/lib/pokemon";

type GameStatus = "playing" | "won";

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
          setState({ ...storedState, correctPokemon });
          if (storedState.status !== "playing") {
            setResultsModalOpen(true);
          }
        } else {
          localStorage.removeItem(`pokewordle-state-${correctPokemon.name}`);
        }
      } catch (error) {
        localStorage.removeItem(`pokewordle-state-${correctPokemon.name}`);
      }
    }
  }, [correctPokemon]);

  useEffect(() => {
    if (state.guesses.length > 0 || state.status !== 'playing') {
      const stateToStore = {
        ...state,
        correctPokemonName: state.correctPokemon.name,
      };
      localStorage.setItem(`pokewordle-state-${correctPokemon.name}`, JSON.stringify(stateToStore));
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
    localStorage.removeItem(`pokewordle-state-${correctPokemon.name}`);
    toast({
      title: "Juego reiniciado",
      description: "¡Tus intentos han sido borrados! Puedes empezar de nuevo.",
    });
  };

  const handleGameEnd = () => {
    setResultsModalOpen(true);
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

      const result = await submitGuessAction(guess, correctPokemon.name);
      
      setState((currentState) => {
        let newStatus: GameStatus = currentState.status;
        let finalFeedback;
        let finalGuesses;

        const optimisticGuessIndex = optimisticState.guesses.length - 1;
        const tempFeedback = [...currentState.feedback];

        if ('error' in result) {
          toast({ title: 'Error', description: result.error, variant: 'destructive' });
          finalGuesses = currentState.guesses.filter(g => g.toLowerCase() !== guess.toLowerCase());
          finalFeedback = currentState.feedback;
        } else {
          finalFeedback = [...currentState.feedback, result];
          finalGuesses = [...currentState.guesses, guess];
          
          if(optimisticGuessIndex >= 0) {
            tempFeedback[optimisticGuessIndex] = result;
          }

          const isCorrect = guess.toLowerCase() === correctPokemon.name.toLowerCase();
          if (isCorrect) {
            newStatus = "won";
            handleGameEnd();
          }
        }
        
        return {
          ...currentState,
          guesses: finalGuesses,
          feedback: tempFeedback,
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

      <Silhouette pokemon={correctPokemon} isRevealed={state.status === 'won'} />
      
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
        feedback={state.feedback as ValidatePokemonGuessOutput[]}
        correctPokemon={correctPokemon.name}
        isOpen={isResultsModalOpen}
        onClose={() => setResultsModalOpen(false)}
      />
    </div>
  );
}
