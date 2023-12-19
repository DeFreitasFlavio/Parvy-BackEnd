import { cardSchema } from './card.model';
import z from 'zod';

export const pyramidSchema = z.object({
  totalLevels: z.number().optional(), /* Nombre total d'étages */
  floor: z.object({
    level: z.number(),
    cards: z.array(cardSchema)
  }).optional(), /* Liste des cartes sur l'étage avec son niveau */
});

export type Pyramid = z.infer<typeof pyramidSchema>