export class Room {
  code: string; /* texte de 6 chiffres */
  state: string; /* en attente, en cours, fini */

  constructor(partial: Partial<Room>) {
    Object.assign(this, partial);
  }
}