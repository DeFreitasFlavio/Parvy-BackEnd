import { Card } from "./card.model";

export interface Player {
    id: number; /* Id unique du joueur */
    currentRoomCode?: string; /* Code de la room dans laquelle le joueur est */
    pseudo: string; /* Pseudo du joueur */
    hand?: [Card]; /* Main du joueur */
    sips?: number; /* Nombre de gorgées du joueur */
  }