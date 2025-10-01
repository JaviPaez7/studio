"use client";

import { useState, useEffect, useTransition } from "react";
import type { ValidatePokemonGuessOutput } from "@/ai/flows/validate-pokemon-guess";
import { submitGuessAction } from "@/app/actions";
import { GuessInput } from "./guess-input";
import { GuessGrid } from "./guess-grid";
import { InstructionsModal } from "./instructions-modal";
import { ResultsModal } from "./results-modal";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw } from "lucide-react";
import { Button } from "./ui/button";

type GameStatus = "playing" | "won";
type GameState = {
  guesses: string[];
  feedback: ValidatePokemonGuessOutput[];
  status: GameStatus;
  correctPokemon: string;
};

interface PokewordleGameProps {
  correctPokemon: string;
  pokemonList: string[];
}

export function PokewordleGame({ correctPokemon, pokemonList }: PokewordleGameProps) {
  const [guesses, setGuesses] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<ValidatePokemonGuessOutput[]>([]);
  const [gameStatus, setGameStatus] = useState<GameStatus>("playing");
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    const today = new Date().toDateString();
    const storedStateRaw = localStorage.getItem(`pokewordle-state`);
    if (storedStateRaw) {
      try {
        const storedState: GameState = JSON.parse(storedStateRaw);
        if (storedState.correctPokemon === correctPokemon) {
          setGuesses(storedState.guesses);
          setFeedback(storedState.feedback);
          setGameStatus(storedState.status);
        } else {
          localStorage.removeItem('pokewordle-state');
        }
      } catch (error) {
        localStorage.removeItem(`pokewordle-state`);
      }
    }
  }, [correctPokemon]);

  useEffect(() => {
    const stateToStore: GameState = { guesses, feedback, status: gameStatus, correctPokemon };
    localStorage.setItem(`pokewordle-state`, JSON.stringify(stateToStore));
  }, [guesses, feedback, gameStatus, correctPokemon]);

  const handleReset = () => {
    setGuesses([]);
    setFeedback([]);
    setGameStatus("playing");
    localStorage.removeItem('pokewordle-state');
    toast({
      title: "Juego reiniciado",
      description: "¡Tus intentos han sido borrados! Puedes empezar de nuevo.",
    });
  };

  const handleGuess = (guess: string) => {
    if (gameStatus !== "playing") return;

    if (!pokemonList.find(p => p.toLowerCase() === guess.toLowerCase())) {
      toast({
        title: "Pokémon no válido",
        description: `"${guess}" no está en la lista de Pokémon.`,
        variant: "destructive",
      });
      return;
    }
    
    if (guesses.find(g => g.toLowerCase() === guess.toLowerCase())) {
        toast({
          title: "Ya lo intentaste",
          description: `Ya has intentado con "${guess}".`,
          variant: "destructive",
        });
        return;
      }

    startTransition(async () => {
      const result = await submitGuessAction(guess, correctPokemon);
      if ('error' in result) {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
        return;
      }
      
      const newGuesses = [...guesses, guess];
      const newFeedback = [...feedback, result];
      
      setGuesses(newGuesses);
      setFeedback(newFeedback);

      const isCorrect = guess.toLowerCase() === correctPokemon.toLowerCase();
      if (isCorrect) {
        setGameStatus("won");
      }
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
      <GuessGrid guesses={guesses} feedback={feedback} />
      {gameStatus === "playing" && (
        <GuessInput
          pokemonList={pokemonList}
          onSubmit={handleGuess}
          disabled={isPending}
        />
      )}
      <ResultsModal
        status={gameStatus}
        guesses={guesses}
        feedback={feedback}
        correctPokemon={correctPokemon}
        isOpen={gameStatus !== "playing"}
        onClose={() => setGameStatus("playing")}
      />
    </div>
  );
}
