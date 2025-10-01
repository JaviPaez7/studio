"use client"

import * as React from "react"
import Image from "next/image";
import { Check, ChevronsUpDown } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { Pokemon } from "@/lib/pokemon";

interface GuessInputProps {
  pokemonList: Pokemon[];
  onSubmit: (guess: string) => void;
  disabled: boolean;
}

const FormSchema = z.object({
  pokemon: z.string({
    required_error: "Por favor, elige un Pokémon.",
  }),
})

export function GuessInput({ pokemonList, onSubmit, disabled }: GuessInputProps) {
  const [open, setOpen] = React.useState(false)

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  })

  function handleSelect(currentValue: string) {
    const value = form.getValues("pokemon")
    const newValue = currentValue === value ? "" : currentValue
    
    if (newValue) {
      onSubmit(newValue);
    }
    
    // We don't reset the form here to allow the user to see what they selected
    // The parent component is responsible for the game flow.
    setOpen(false);
  }

  // We keep the form to handle the popover state and structure, but submit is manual
  return (
    <Form {...form}>
      <form onSubmit={(e) => e.preventDefault()} className="flex w-full items-start space-x-2">
        <FormField
          control={form.control}
          name="pokemon"
          render={({ field }) => (
            <FormItem className="flex flex-col w-full">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className={cn(
                        "w-full justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                      disabled={disabled}
                    >
                      {disabled ? 'Adivinando...' : 'Escribe un nombre de Pokémon...'}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder="Buscar Pokémon..." />
                    <CommandEmpty>Pokémon no encontrado.</CommandEmpty>
                    <CommandList>
                      <CommandGroup>
                        {pokemonList.map((pokemon) => (
                          <CommandItem
                            value={pokemon.name}
                            key={pokemon.id}
                            onSelect={handleSelect}
                          >
                             <Image src={pokemon.spriteUrl} alt={pokemon.name} width={24} height={24} className="mr-2"/>
                            {pokemon.name}
                            <Check
                              className={cn(
                                "ml-auto h-4 w-4",
                                field.value && field.value.toLowerCase() === pokemon.name.toLowerCase() ? "opacity-100" : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}
