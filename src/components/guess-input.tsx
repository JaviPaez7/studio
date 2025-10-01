"use client"

import * as React from "react"
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

interface GuessInputProps {
  pokemonList: string[];
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

  function handleFormSubmit(data: z.infer<typeof FormSchema>) {
    onSubmit(data.pokemon)
    form.reset({ pokemon: "" })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="flex w-full items-start space-x-2">
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
                      {field.value
                        ? pokemonList.find(
                            (p) => p.toLowerCase() === field.value.toLowerCase()
                          )
                        : "Escribe un nombre de Pokémon..."}
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
                            value={pokemon}
                            key={pokemon}
                            onSelect={(currentValue) => {
                              form.setValue("pokemon", currentValue === field.value ? "" : currentValue)
                              setOpen(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                field.value && field.value.toLowerCase() === pokemon.toLowerCase() ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {pokemon}
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
        <Button type="submit" disabled={disabled} className="bg-accent hover:bg-accent/90">
          {disabled ? '...' : '¡Intentar!'}
        </Button>
      </form>
    </Form>
  )
}
