import { println, VERBOSE } from "../app";
import Card from "./Card";
import CardCollection from "./CardCollection";
import CardMatch from "./CardMatch";
import Deck from "./Deck";
import PokerGame from "./Poker";
import WebSocket from "ws";
import { PokerProtocolStatus } from "../websockets";

export default class Player implements CardCollection{
    public game: PokerGame;

    public cards: Card[] = new Array<Card>();
    public money: number;
    public name: string;
    public matches: CardMatch[];
    public socket: WebSocket | undefined;

    public constructor(game: PokerGame, socket?: WebSocket, name: string = "", money: number = 0, cards?: Card[]){
        this.game = game;
        this.socket = socket;
        
        this.name = name;
        this.money = money;
        if(typeof cards != "undefined") this.cards = cards;
        this.matches = new Array<CardMatch>();
    }

    public startBet(){
        this.socket?.send(JSON.stringify({
            action: "startBet",
            money: this.money,
        }));
    }

    public placeBet(ammount: number | undefined): PokerGame{
        if(ammount == undefined) throw new Error("Invalid Bet! - No ammmount was specified");
        if(this.game.active == this && this.money > ammount){
            this.money -= ammount;
            this.game.ante(ammount);

            this.socket?.send(JSON.stringify({
                money: this.money,
                action: "success",
            }));

            return this.game;
        } else {
            this.socket?.send(JSON.stringify({
                action: "error",
                reason: "Invalid Bet!"
            }));
            throw new Error("Invalid bet - Not enough funds!");
        }
    }

    public nudgeMoney(ammount: number){
        this.money += ammount;
        this.socket?.send(JSON.stringify({
            action: "success",
            money: this.money,
        }));
    }

    public dealCard(deck: Deck){
        let c: Card = deck.popCardIndex(0);
        c.collection = this;

        this.cards.push(c);

        let message: PokerProtocolStatus = {
            action: "update",
            money: this.money,
            cards: new Array<JSON>()
        }

        for(let c of this.cards) message.cards?.push({value: c.getValue(), suit: c.getSuit().getName()});

        this.socket?.send(JSON.stringify(message));

        if (VERBOSE) println("The card", c, "was moved from deck", deck, "to hand", this);
        return this;
    }

    public merge(collection: CardCollection): Player {   // Push all cards from another card collection
        this.cards.push(...collection.cards);
        return this;
    }
    public length(): number { return this.cards.length; }

    public toString(): string {
        let out: string = `Player (${this.name}) with ${this.money} money ranked ${this.matches.length == 0 ? 0 : this.matches[0].rank}: [`;
        for(let c of this.cards) out += `${this.cards.indexOf(c)}: ${c}, `;
        out += "]";
        return out;
    }
}