import { println, VERBOSE } from "../app";
import Card from "./Card";
import CardCollection from "./CardCollection";
import CardMatch from "./CardMatch";
import Deck from "./Deck";

export default class Player implements CardCollection{
    public cards: Card[] = new Array<Card>();
    public money: number;
    public bet: number;
    public name: string;
    public matches: CardMatch[];

    public constructor(name: string = "", money: number = 0, cards?: Card[]){
        this.name = name;
        this.money = money;
        this.bet = 0;
        if(typeof cards != "undefined") this.cards = cards;
        this.matches = new Array<CardMatch>();
    }

    public dealCard(deck: Deck){
        let c: Card = deck.popCardIndex(0);
        c.collection = this;

        this.cards.push(c);

        if (VERBOSE) println("The card", c, "was moved from deck", deck, "to hand", this);
        return this;
    }

    public merge(collection: CardCollection): Player {   // Push all cards from another card collection
        this.cards.push(...collection.cards);
        return this;
    }
    public length(): number { return this.cards.length; }

    public toString(): string {
        let out: string = `Hand (${this.name}) with ${this.money} money ranked ${this.matches.length == 0 ? 0 : this.matches[0].rank}: [`;
        for(let c of this.cards) out += `${this.cards.indexOf(c)}: ${c}, `;
        out += "]";
        return out;
    }
}