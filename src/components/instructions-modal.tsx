"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";

export function InstructionsModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <HelpCircle className="h-6 w-6" />
          <span className="sr-only">Instrucciones</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">¿Cómo Jugar a Pokewordle?</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4 text-muted-foreground">
          <p>
            ¡Adivina el Pokémon misterioso del día! Tienes intentos ilimitados para encontrarlo.
          </p>
          <p>
            Después de cada intento, recibirás pistas de colores para guiarte hacia la respuesta correcta.
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-green-500" />
              <p><span className="font-bold text-foreground">VERDE:</span> ¡Correcto! El atributo coincide.</p>
            </div>
             <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-yellow-400" />
              <p><span className="font-bold text-foreground">AMARILLO:</span> Parcialmente correcto.</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-red-500" />
              <p><span className="font-bold text-foreground">ROJO:</span> Incorrecto. El atributo no coincide.</p>
            </div>
          </div>
          <p className="pt-2 text-sm">
            Una pista amarilla puede significar que el tipo es correcto pero no es el principal, o que la altura/peso está cerca.
          </p>
           <p className="pt-2 text-sm">
            Las flechas te indicarán si el valor correcto es más alto (↑) o más bajo (↓) para la altura y el peso.
          </p>
          <p className="pt-4 font-bold text-center text-foreground">
            ¡Mucha suerte, entrenador!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
