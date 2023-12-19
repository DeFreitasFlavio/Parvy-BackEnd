import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { CacheIORedis } from 'src/app.module';
import { Card, cardSchema } from 'src/models/card.model';
import { Player, playerSchema } from 'src/models/player.model';
import { Pyramid, pyramidSchema } from 'src/models/pyramid.model';

@Injectable()
export class GameService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: CacheIORedis) {}

    async startGame(code: string, etages: number): Promise<{}> {
        this.createCards(code);

        const client = this.cacheManager.store.getClient();

        let cards: Card[] = [];
        let players: Player[] = [];
        let playerCard: Card[] = [];
        const nbCardsInHand = 4;
        let pyramide: Pyramid = {
            'totalLevels': etages
        };

        //Récupération des cartes dans un tableau
        for (let i = 1; i <= 52; i++) {
            const card = cardSchema.parse(await client.hgetall(code + '/card/' + i));
            cards.push(card);
        }

        //Mélange des cartes dans la pioche
        for (let i = 0; i < cards.length - 1; i++) {
            const j = (i + Math.floor(Math.random() * (cards.length - i - 1))) % cards.length;
            [cards[i], cards[j]] = [cards[j], cards[i]];
        }

        const playerList = await client.smembers(code + '/players'); /* liste des id players */
        const nbPlayersInRoom = playerList.length; /* nombre de joueurs dans la room */

        //Pour chaque joueur dans la room retirer des cartes de la pioche et lui donner les cartes dans la main
        for (let i = 0; i < nbPlayersInRoom; i++) {
            const player = playerSchema.parse(await client.hgetall(playerList[i]));
            console.log(player);
            //Pour chaque carte à mettre dans la main
            for (let j = 0; j < nbCardsInHand; j++) {
                const currentCard = cards.pop();
                if (!currentCard) {
                    throw new Error('No card left to deal');
                }
                await client.hset(code+'/players/'+player.id+'/hand/card/'+currentCard.id, currentCard);
                await client.del(code+'/card/'+currentCard.id);
                playerCard.push(currentCard);
            }
            // Trier le tableau playerCard
            playerCard.sort((a, b) => Number(a.id) - Number(b.id));

            //Ajouter la main du joueur au joueur
            Object.assign(player, { "hand": playerCard });
            players.push(player);
        }

        let nbCardsInPyramid = 0;
        for (let i = 1; i <= etages; i++) {
            nbCardsInPyramid += i;
        }

        if (cards.length - players.length * nbCardsInHand + nbCardsInPyramid <= 0) {
            throw new Error('Number of floors to big');
        }

        //Création de la pyramide. Pour chaque étage, attribuer un nombre de carte
        for (let numEtage = etages; numEtage > 0; numEtage--) {
            //Récupérer le nombre de carte pour les mettre dans la pyramide
            const cardsInFloor: Card[] = [];
            for (let nbCardsInFloor = numEtage; nbCardsInFloor > 0; nbCardsInFloor--) {
                const currentCard = cards.pop();
                if (!currentCard) {
                    throw new Error('No card left to deal pyramid');
                }
                cardsInFloor.push(currentCard);
                await client.del(code+'/card/'+currentCard.id);
            }
            const nameObjectCurrentFloor = `floor${numEtage}`;
            Object.assign(pyramide, {
                [nameObjectCurrentFloor]: {
                    'level': numEtage,
                    'cards': cardsInFloor
                }
            })
        }

        let response = {
            response: 'ok',
            cards,
            players,
            pyramide
        }

        return response;
    }

    private async createCards(code: string) {
        const client = this.cacheManager.store.getClient();

        const colors = ['red', 'black'];
        const blackSignes = ['pique', 'trefle'];
        const redSignes = ['carreau', 'coeur'];
        const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        let idCard = 1;

        for (let color in colors) {
            //Générer les cartes rouges
            if (colors[color] === 'red') {
                for (let signe in redSignes) {
                    for (let value in values) {
                        await client.hset(
                            code + '/card/' + idCard, 
                            'id', idCard, 
                            'value', values[value],
                            'signe', redSignes[signe],
                            'color', colors[color],
                            'face', 0,
                            'image', redSignes[signe]+'-'+values[value]+'.png'
                        );
                        idCard += 1;
                    }
                }
            }

            //Générer les cartes noires
            if (colors[color] === 'black') {
                for (let signe in blackSignes) {
                    for (let value in values) {
                        await client.hset(
                            code + '/card/' + idCard, 
                            'id', idCard, 
                            'value', values[value],
                            'signe', redSignes[signe],
                            'color', colors[color],
                            'face', 0,
                            'image', redSignes[signe]+'-'+values[value]+'.png'
                        );
                        idCard += 1;
                    }
                }
            }
        }
    }
}