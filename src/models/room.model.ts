import { Player } from "./player.model";
import { Card } from "./card.model";

export class Room {
  code: string; /* texte de 6 chiffres */
  state: string; /* en attente, en cours, fini */
  deckCards: { /* Liste de carte dans le paquet de début */
    totalCards: number,
    list: [Card]
  };
  players: [Player]; /* liste des joueurs dans la partie */

  constructor(partial: Partial<Room>) {
    Object.assign(this, partial);
  }
}