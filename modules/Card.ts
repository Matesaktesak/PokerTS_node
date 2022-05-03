import Suit from "./Suit";
import CardCollection from "./CardCollection";


export default class Card{
    private suit: Suit;
    private value: number;
    private valueName: string;
    private name: string;
    private shortname: string;

    public collection: CardCollection;

    public constructor(value: number, suit: Suit, collection?: CardCollection){
        if(value < 1 || value > 14) throw `Invalid value! (${value})`;
        
        this.value = value;
        this.suit = suit;

        this.valueName = this.getNameByValue();
        this.name = `${this.valueName} of ${this.suit.getName()}`;
        this.shortname = this.valueName.substring(0, this.valueName == "10" ? 2 : 1);

        if (typeof collection !== 'undefined') this.collection = collection;
    }

    public update(): Card {
        this.suit.card = this;

        return this;
    }

    public getNameByValue(value: number = this.value): string{
        let out: string = "";
        
        if (value >= 2 && value <= 10) out = value.toString();
        if (value == 1 || value == 14) out = "Ace";
        if (value == 11) out = "Jack";
        if (value == 12) out = "Queen";
        if (value == 13) out = "King";

        return out;
    }

    public toString(): string{ return this.name; }      // toString method "override"

    public setCollection(collection: CardCollection): Card {    // Collection setter
        this.collection = collection;
        return this;
    }

    public getCollection(): CardCollection { return this.collection; }  // Collection getter
}