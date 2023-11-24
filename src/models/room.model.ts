import { Player } from "./player.model";
import { Card } from "./card.model";

export interface Room {
  code: string; /* texte de 6 chiffres */
  state: string; /* en attente, en cours, fini */
  deckCards?: { /* Liste de carte dans le paquet de début */
    totalCards: number,
    list: Card[]
  };
  playersId?: string[]; /* liste des joueurs dans la partie */
}