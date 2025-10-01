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
  status: "playing" | "won" | "lost";
  guesses: string[];
  feedback: ValidatePokemonGuessOutput[];
  correctPokemon: string;
  isOpen: boolean;
}

const emojiMap = {
  green: "🟩",
  yellow: "🟨",
  gray: "⬜",
};

export function ResultsModal({ status, guesses, feedback, correctPokemon, isOpen }: ResultsModalProps) {
  const { toast } = useToast();

  const handleShare = () => {
    const feedbackGrid = feedback
      .map((fb) =>
        Object.values(fb)
          .map((f) => emojiMap[f as keyof typeof emojiMap])
          .join("")
      )
      .join("\n");

    const shareText = `¡Adiviné el Pokémon de hoy en ${guesses.length}/6 intentos en #Pokewordle! 🏆\n\n${feedbackGrid}\n\n¿Puedes superar mi marca? ¡Juega aquí!`;
    
    navigator.clipboard.writeText(shareText).then(() => {
      toast({
        title: "¡Resultado copiado!",
        description: "¡Ahora compártelo con tus amigos!",
      });
    });
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">
            {status === 'won' ? '¡Felicidades, Maestro Pokémon!' : '¡Se te ha escapado!'}
          </DialogTitle>
          <DialogDescription>
            {status === 'won' 
              ? `Lo has logrado en ${guesses.length} intentos.`
              : `El Pokémon de hoy era: ${correctPokemon}.`
            }
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-center text-muted-foreground">
            ¡Vuelve mañana por el nuevo desafío!
          </p>
        </div>
        {status === 'won' && (
          <DialogFooter>
            <Button onClick={handleShare} className="w-full bg-accent hover:bg-accent/90">Compartir Resultado</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
