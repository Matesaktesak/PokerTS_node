import Card from "./Card";
import CardCollection from "./CardCollection";
import Deck from "./Deck";
import { println, VERBOSE} from "../app";

type Deal = "Start" | "HandOut" | "Flop" | "Turn" | "River" | "Showdown";

export default class Community implements CardCollection{
    public cards: Card[] = new Array<Card>();
    public deal: Deal;

    public money: number;

    public constructor(cards?: Card[]){
        if (typeof cards != "undefined") this.cards.push(...cards);
        this.money = 0;
        this.deal = "Start";
    }

    public merge(collection: CardCollection): Community {   // Push all cards from another card collection
        this.cards.push(...collection.cards);
        return this;
    }

    public dealCard(deck: Deck): Community {  // Dealing rounds organizer - to be used for betting as well
        switch (this.length()) {
            case 0:
                this.flop(deck);  // First deal
                break;
            case 3:
                this.turn(deck);  // Second deal
                break;
            case 4:
                this.river(deck);  // Third deal
                break;
        }
        return this;
    }

    public flop(deck: Deck): Community {
        if (VERBOSE) println(this, "has entered FLOP");
        deck.popIndex(0);  // Burn a card
        if (VERBOSE) println("A card was burned, now the deck has ", deck.length(), "cards");

        for (let i = 0; i < 3; i++) this.moveCard(deck);  // Move three cards from the deck to the community

        this.deal = "Flop";
        return this;
    }

    public turn(deck: Deck): Community {
        if (VERBOSE) println(this, "has entered TURN");
        deck.popIndex(0);  // Burn a card
        if (VERBOSE) println("A card was burned, now the deck has ", deck.length(), "cards");

        this.moveCard(deck);  // Move the fourth card from the deck to this community

        this.deal = "Turn";
        return this;
    }

    public river(deck: Deck): Community {
        if (VERBOSE) println(this, "has entered RIVER");
        deck.popIndex(0);  // Burn a card
        if (VERBOSE) println("A card was burned, now the deck has ", deck.length(), "cards");

        this.moveCard(deck);  // Move the fifth card from the deck to this community

        this.deal = "River";
        return this;
    }

    public moveCard(deck: Deck) {
        let c: Card = deck.popCardIndex(0);
        this.cards.push(c);
        this.assignCards();

        if (VERBOSE) println("The card", c, "has been moved from ", deck, "to", this);
    }

    public assignCards(): Community {
        for(let c of this.cards) c.setCollection(this);
        return this;
    }

    public length(): number { return this.cards.length; }
    public toString(): string { return `Community in ${this.deal} and ${this.money} in the pot with cards: ${this.cards}`; }
}