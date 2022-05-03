import Card from "./Card";
import CardCollection from "./CardCollection";
import Suit from "./Suit";

export default class Deck implements CardCollection{
    public cards: Card[];
    
    public constructor(...cards: Card[]){
        if(cards.length == 0){
            this.cards = new Array<Card>();
            for(let suit = 0; suit < 4; suit++) for(let val = 1; val <= 13; val++){
                this.cards.push(new Card(val, new Suit(suit)));
            }
        } else {
            this.cards = cards;
        }
    }

    public shuffle(): Deck{
        this.cards.sort(() => 10*(Math.random()-0.5));
        return this;
    }

    public push(...c: Card[]): Deck{    // Add one or more cards to the deck
        this.cards.push(...c);
        return this;
    }

    public pop(c: Card): Deck{
        this.cards.splice(this.cards.indexOf(c), 1);
        return this;
    }

    public popIndex(c: number): Deck {
        this.cards.splice(c, 1);
        return this;
    }

    public merge(collection: CardCollection): Deck{   // Push all cards from another card collection
        this.cards.push(...collection.cards);
        return this;
    }

    public pushCard(c: Card): Card{ // Push one card and keep it accesible
        this.cards.push(c);
        return c;
    }

    public popCard(c: Card): Card { return this.cards.splice(this.cards.indexOf(c), 1)[0]; }    // Sigle card pop and return that card for further work

    public popCardIndex(c: number): Card { return this.cards.splice(c, 1)[0]; }     // Sigle card pop at index and return that card for further work

    public getTop(): Card{ return this.cards[0]; } // Top card getter

    public length(): number { return this.cards.length; }   // Length getter
    public toString(): string {     // toString() method "override"
        let out: string = `Deck with ${this.length()} cards: [ \n`;
        for(let c of this.cards) out += `\t - ${this.cards.indexOf(c)}: ${c},\n`;
        out += "]";

        return out;
    }
}