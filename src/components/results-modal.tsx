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

export function ResultsModal({ status, guesses, feedback, correctPokemon, isOpen, onClose }: ResultsModalProps) {
  const { toast } = useToast();

  if (status === 'playing') {
    return null;
  }

  const handleShare = () => {
    const feedbackGrid = feedback
      .map((fb) => {
        const { guessedPokemon, heightDirection, weightDirection, ...feedbackValues } = fb;
        return Object.values(feedbackValues)
          .map((f) => emojiMap[f as keyof typeof emojiMap])
          .join("");
      })
      .join("\n");

    const shareText = `¡Adiviné el Pokémon de hoy en ${guesses.length} intentos en #Pokewordle! 🏆\n\n${feedbackGrid}\n\n¿Puedes superar mi marca? ¡Juega aquí!`;
    
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


  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">
            ¡Felicidades, Maestro Pokémon!
          </DialogTitle>
          <DialogDescription>
            Lo has logrado en ${guesses.length} intentos. El Pokémon era: ${correctPokemon}.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-center text-muted-foreground">
            ¡Vuelve mañana por el nuevo desafío!
          </p>
        </div>
        <DialogFooter>
          <Button onClick={handleShare} className="w-full bg-accent hover:bg-accent/90">Compartir Resultado</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
