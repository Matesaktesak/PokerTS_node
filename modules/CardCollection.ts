import Card from "./Card";

export default interface CardCollection{
    cards: Card[];
    length(): number;
    toString(): string;
    merge(collection: CardCollection): CardCollection;
    
    /*merge(coll: CardCollection): CardCollection{   // Push all cards from another card collection
        this.cards.push(...coll.cards);
        return this;
    }
    */
}
