import { Card } from './card.model';

export interface Pyramid {
  totalLevels?: number /* Nombre total d'étages */;
  floor?: {
    /* Liste des cartes sur l'étage avec son niveau */ level: number;
    cards: [Card];
  };
}
