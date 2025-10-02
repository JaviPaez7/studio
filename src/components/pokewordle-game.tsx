
"use client";

import { useState, useEffect, useTransition } from "react";
import type { ValidatePokemonGuessOutput } from "@/lib/types";
import { GuessInput } from "./guess-input";
import { GuessGrid } from "./guess-grid";
import { InstructionsModal } from "./instructions-modal";
import { ResultsModal } from "./results-modal";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import type { Pokemon } from "@/lib/pokemon";
import { POKEMON_DATA } from "@/lib/pokemon-data";
import { comparePokemon } from "@/lib/comparison";

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
          handleReset(false);
        }
      } catch (error) {
        handleReset(false);
      }
    } else {
      handleReset(false);
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
  }, [state]);
  
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

  const handleGameEnd = (status: "won") => {
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

    const guessedPokemonData = POKEMON_DATA.find(p => p.name.toLowerCase() === guess.toLowerCase());
    const correctPokemonData = POKEMON_DATA.find(p => p.name.toLowerCase() === correctPokemon.name.toLowerCase());

    if (!guessedPokemonData || !correctPokemonData) {
        toast({ title: 'Error', description: "No se pudieron encontrar los datos del Pokémon.", variant: 'destructive' });
        return;
    }

    const feedbackResult = comparePokemon(guessedPokemonData, correctPokemonData);
    
    const result: ValidatePokemonGuessOutput = {
        ...feedbackResult,
        guessedPokemon: {
            name: guessedPokemonData.name,
            photoUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${guessedPokemonData.id}.png`,
            type: guessedPokemonData.types[0],
            secondaryType: guessedPokemonData.types[1] || 'N/A',
            habitat: guessedPokemonData.habitat,
            evolutionStage: `Stage ${guessedPokemonData.evolutionStage}`,
            height: `${guessedPokemonData.height}m`,
            weight: `${guessedPokemonData.weight}kg`,
        }
    };

    const isCorrect = guess.toLowerCase() === correctPokemon.name.toLowerCase();

    setState((currentState) => ({
      ...currentState,
      guesses: [...currentState.guesses, guess],
      feedback: [...currentState.feedback, result],
    }));

    if (isCorrect) {
      handleGameEnd("won");
    }
  };

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
      
      <GuessGrid guesses={state.guesses} feedback={state.feedback} />
      
      {state.status === "playing" && (
        <GuessInput
          pokemonList={pokemonList}
          onSubmit={handleGuess}
          disabled={isPending || state.status !== 'playing'}
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
        isOpen={isResultsModalOpen}
        onClose={() => setResultsModalOpen(false)}
      />
    </div>
  );
}
