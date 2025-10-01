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
            Adivina el Pokémon misterioso de hoy. ¡Puedes hacer tantos intentos como necesites!
          </p>
          <p>
            Después de cada intento, las pistas de tu Pokémon se iluminarán para mostrar qué tan cerca estás de la solución.
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-green-500" />
              <p><span className="font-bold text-foreground">VERDE:</span> ¡Correcto! El dato coincide exactamente.</p>
            </div>
             <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-yellow-400" />
              <p><span className="font-bold text-foreground">AMARILLO:</span> Parcialmente Cerca. El dato está relacionado.</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-red-500" />
              <p><span className="font-bold text-foreground">ROJO:</span> Incorrecto. El dato no coincide.</p>
            </div>
          </div>
          <p className="pt-2 text-sm">
            Ejemplo de pista amarilla: el tipo del Pokémon es correcto, pero no es su tipo primario, o el atributo (altura/peso) está en un rango cercano.
          </p>
           <p className="pt-2 text-sm">
            Para la altura y el peso, una flecha te indicará si el valor correcto es mayor (↑) o menor (↓).
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
