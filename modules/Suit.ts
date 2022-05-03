import Card from "./Card";

export default class Suit{
    private color: string = "Red" || "Black";
    private name: string;
    private suit: string = 'C' || 'H' || 'S' || 'D';
    public card: Card;

    public constructor(suit: string | number){
        if(typeof suit == "string") this.suit = suit.charAt(0);
        
        switch(suit){
            case 0:
            case 'C':
                this.color = "Black";
                this.name = "Clubs";
                break;
            case 1:
            case 'H':
                this.color = "Red";
                this.name = "Hearts";
                break;
            case 2:
            case 'S':
                this.color = "Black";
                this.name = "Spades";
                break;
            case 3:
            case 'D':
                this.color = "Red";
                this.name = "Diamonds";
                break;
        }
    }

    public getName(): string {
        return this.name;
    }

    public getColor(): string {
        return this.color;
    }

    public getSuit(): string {
        return this.suit;
    }
}