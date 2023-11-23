import { Card } from "./card.model";

export class Pyramid {
    totalLevels: number; /* Nombre total d'étages */
    floor: { /* Liste des cartes sur l'étage avec son niveau */
        level: number,
        cards: [Card]
    };
  
    constructor(partial: Partial<Pyramid>) {
      Object.assign(this, partial);
    }
  }