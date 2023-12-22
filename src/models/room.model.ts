import { cardSchema } from './card.model';
import z from 'zod';
import { playerSchema } from './player.model';

export const roomSchema = z.object({
  code: z.string(), /* texte de 6 chiffres */
  state: z.string(), /* en attente, en cours, fini */
  deckCards: z.object({
    totalCards: z.number(),
    list: z.array(cardSchema), /* Liste de carte dans le paquet de début */
  }).optional(),
  playersId: z.array(playerSchema).optional(), /* liste des joueurs dans la partie */
});

export type Room = z.infer<typeof roomSchema>