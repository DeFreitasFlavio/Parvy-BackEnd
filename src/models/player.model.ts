import { cardSchema } from './card.model';
import z from 'zod';

export const playerSchema = z.object({
  id: z.string().optional(), /* Id unique du joueur */
  currentRoomCode: z.string().optional(), /* Code de la room dans laquelle le joueur est */
  pseudo: z.string().optional(), /* Pseudo du joueur */
  hand: z.array(cardSchema).optional(), /* Main du joueur */
  sips: z.number().optional() /* Nombre de gorgées du joueur */
});

export type Player = z.infer<typeof playerSchema>