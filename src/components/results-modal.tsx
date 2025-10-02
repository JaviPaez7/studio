"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { ValidatePokemonGuessOutput } from "@/ai/flows/validate-pokemon-guess";

interface ResultsModalProps {
  status: "playing" | "won";
  stats: {
    gamesPlayed: number;
    wins: number;
    currentStreak: number;
    maxStreak: number;
  };
  guesses: string[];
  feedback: ValidatePokemonGuessOutput[];
  correctPokemon: string;
  isOpen: boolean;
  onClose: () => void;
}

const emojiMap = {
  green: "🟩",
  yellow: "🟨",
  red: "🟥",
};

const StatCard = ({ label, value }: { label: string; value: number }) => (
  <div className="flex flex-col items-center justify-center rounded-lg bg-secondary p-4 text-secondary-foreground">
    <div className="text-2xl font-bold">{value}</div>
    <div className="text-xs font-light uppercase tracking-wider">{label}</div>
  </div>
);


export function ResultsModal({ status, stats, guesses, feedback, correctPokemon, isOpen, onClose }: ResultsModalProps) {
  const { toast } = useToast();

  if (status === 'playing') {
    return null;
  }
  
  const isWin = status === 'won';

  const handleShare = () => {
    const feedbackGrid = feedback
      .map((fb) => {
        if (!fb) return '⬜️'.repeat(6);
        const { guessedPokemon, heightDirection, weightDirection, ...feedbackValues } = fb;
        return Object.values(feedbackValues)
          .map((f) => emojiMap[f as keyof typeof emojiMap] || '🟥')
          .join("");
      })
      .join("\n");

    const shareText = isWin 
      ? `¡Adiviné el Pokémon de hoy en ${guesses.length} intentos en #Pokewordle! 🏆\n\n${feedbackGrid}\n\n¿Puedes superar mi marca? ¡Juega aquí! https://pokewordle-daily.web.app`
      : `No pude adivinar el Pokémon de hoy en #Pokewordle. 😔\n\n${feedbackGrid}\n\n¿Podrás adivinarlo? ¡Juega aquí! https://pokewordle-daily.web.app`;
    
    navigator.clipboard.writeText(shareText).then(() => {
      toast({
        title: "¡Resultado copiado!",
        description: "¡Ahora compártelo con tus amigos!",
      });
    });
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  const title = "¡Felicidades, Maestro Pokémon!";
  const description = `Lo has logrado en ${guesses.length} intentos. El Pokémon era: ${correctPokemon}.`;


  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-4 gap-2 text-center py-4">
            <StatCard label="Jugados" value={stats.gamesPlayed} />
            <StatCard label="Victorias" value={stats.wins} />
            <StatCard label="Racha Actual" value={stats.currentStreak} />
            <StatCard label="Mejor Racha" value={stats.maxStreak} />
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-row">
          <Button onClick={handleShare} className="w-full bg-accent hover:bg-accent/90">Compartir Resultado</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
