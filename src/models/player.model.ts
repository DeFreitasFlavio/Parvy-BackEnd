import { Card } from './card.model';

export interface Player {
  id: number /* Id unique du joueur */;
  pseudo: string /* Pseudo du joueur */;
  hand?: [Card] /* Main du joueur */;
  sips?: number /* Nombre de gorgées du joueur */;
}
