import z from 'zod';

export const cardSchema = z.object({
  id: z.string(), /* id de la carte */
  value: z.string(), /* 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K' */
  signe: z.string(), /* carreau, pique, coeur, trefle */
  color: z.string(), /* couleur de la carte */
  face: z.string(), /* 1 = recto, 0 = verso */
  image: z.string(), /* nom de l'image de la carte */
});

export type Card = z.infer<typeof cardSchema>
