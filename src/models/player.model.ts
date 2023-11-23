import { Card } from "./card.model";

export class Player {
    id: number; /* Id unique du joueur */
    pseudo: string; /* Pseudo du joueur */
    hand: [Card]; /* Main du joueur */
    sips: number; /* Nombre de gorgées du joueur */
  
    constructor(partial: Partial<Player>) {
      Object.assign(this, partial);
    }
  }