export class Card {
    signe: string; /* carreau, pique, coeur, trefle */
    color: string; /* couleur de la carte */
    face: boolean; /* 1 = recto, 0 = verso */
  
    constructor(partial: Partial<Card>) {
      Object.assign(this, partial);
    }
  }