import { println, VERBOSE } from "../app";
import Card from "./Card";
import CardCollection from "./CardCollection";
import Suit from "./Suit";

export default class CardMatch{
    public cards: Card[] = new Array<Card>();
    public rank: number;

    constructor(rank: number = 1, ...cards: Card[]){
        this.rank = rank;
        this.cards.push(...cards);
    }

    public toString(): string{ return ` Match "${this.getRankName()}"(${this.rank}): [${this.cards}]`; }
    public getRankName(): string{ return CardMatch.rankNames[Math.floor(this.rank)-1]}

    public static rankNames: string[] = ["High card", "Pair", "Two Pairs", "Three of a kind", "Straight", "Flush", "Full house", "Four of a kind (Poker)", "Straight flush", "Royal Flush"];

    public static match(deck: CardCollection): CardMatch[]{
        if (VERBOSE) println("Begining matching in", deck);

        let found: CardMatch[] = new Array<CardMatch>();
        let cards = deck.cards;

        cards.sort((a: Card, b: Card) => (a.getValue() < b.getValue() ? -1 : 1));  // Sorting is going to simplify a lot later

        // High Card
        for(let c of cards){
            if(c.getValue() == 1) c.setValue(14);   // All ACEs so far should be counted as High Ace (above king - 14)
            found.push(new CardMatch(1 + c.getValue() / 100, c));
        }

        // Twoes
        for(let i = 0; i < cards.length - 1; i++) {     // For every (but the last) card
            let c1: Card = cards[i];                    // Get the two (or 3 || 4) consecutive cards cards (if they exist)
            let c2: Card = cards[i + 1];
            let c3: Card | undefined = cards.length - i >= 3 ? cards[i + 2] : undefined;
            let c4: Card | undefined = cards.length - i >= 4 ? cards[i + 3] : undefined;

            if (c1.getValue() == c2.getValue()) {    // If they match by value - they make a pair
                let top: number = c1.getValue() > c2.getValue() ? c1.getValue() : c2.getValue();

                // Threes - perhaps a third card is further going to match the existing pair
                if (c3 != undefined && c3.getValue() == c1.getValue()) {  // Check whether it is maybe a Three not just a Pair
                    top = top > c3.getValue() ? top : c3.getValue();

                    // Fours - perhaps a fourth card is further going to match the existing three
                    if (c4 != undefined && c4.getValue() == c1.getValue()) {  // Check whether it is maybe a Four of a Kind not just a Three
                        top = top > c4.getValue() ? top : c4.getValue();

                        found.push(new CardMatch(8 + top / 100, c1, c2, c3, c4));
                        if (VERBOSE) println("A \"Four of a kind\" match was found:", found[found.length - 1].cards);
                    } else { //  If no fourth card was found, push the three of a kind
                        found.push(new CardMatch(4 + top / 100, c1, c2, c3));
                        if (VERBOSE) println("A \"Three of a kind\" match was found:", found[found.length - 1].cards);
                    }
                } else {// If no third or fourth card was found, push the pair
                    found.push(new CardMatch(2 + top / 100, c1, c2));
                    if (VERBOSE) println("A \"Pair\" match was found:", found[found.length - 1].cards);
                }
            }
        }

        // Two pairs (Hacky (we don't get all pairs of pairs) solution but I think the edge case was avoided, because we get a pair out of the three, therefore its getValue( as highcard is acounted for)
        found.sort((a: CardMatch, b: CardMatch) => (a.rank < b.rank ? -1 : 1)); // Sorting is going to simplify a lot later
        for (let i = 0; i < found.length - 1; i++) if (Math.floor(found[i].rank) == 2 && Math.floor(found[i + 1].rank) == 2) {
            found.push(new CardMatch(3 + (found[i + 1].rank - 2), ...found[i].cards, ...found[i + 1].cards));
            if (VERBOSE) println("A \"Two Pairs\" match was found:", found[found.length - 1].cards);
        }

        // Now we need both high and low aces, so I'll just duplicate them
        /*
        for (let c of cards) {
            if (c.getValue() == 1) cards.push(new Card(1, c.getSuit()));
        }

        println(cards);
        */

        // Straight
        let total : number = 1;
        let start : number = 0;
        let starti: number  = 0;

        if (VERBOSE) println("Starting \"Straight\" matching");
        for (let c of cards) {
            if (c.getValue() == start + total -1) continue;
            if (c.getValue() != start + total) {  // Reset if the card doesn't fall in line
                start = c.getValue();
                starti = cards.indexOf(c);
                total = 1;
                if (VERBOSE) println("Reseting the Straight match - a break was found");
            } else {
                total++;
                if (VERBOSE) println("Current total sequential number of cards:", total);
            }
        
            let top: number = start + total - 1;
            if (total == 5) {
                found.push(new CardMatch(5 + top / 100, ...cards.slice(starti, starti + total)));
                if (VERBOSE) println("A \"Straight\" match was found:", found[found.length - 1].cards);

                // Check for a straight flush
                if (this.flushFinder(...cards.slice(starti, starti + total)).length > 0) {
                    found.push(new CardMatch(9 + top / 100, ...cards.slice(starti, starti + total)));
                    if (VERBOSE) println("A \"Straight Flush\" match was found:", found[found.length - 1].cards);

                    // Check for Royal Flush
                    if (start == 10) {
                        found.push(new CardMatch(10 + top / 100, ...cards.slice(starti, starti + total)));
                        if (VERBOSE) println("A \"Royal Flush\" match was found:", found[found.length- 1].cards);
                    }
                }
            }
        }

        // Flush
        found.push(...this.flushFinder(...cards));

        // Full house
        let i: CardMatch[] = new Array<CardMatch>(...found);
        for(let cm of i) if(Math.floor(cm.rank) == 4) {
            if(VERBOSE) println("Trying FullHouse for", cm);
            let rest: CardMatch[] = new Array<CardMatch>(...found);
            rest.splice(rest.indexOf(cm), 1);
            
            for (let cm2 of rest) if (Math.floor(cm2.rank) == 2) {
                let counter: number = 0;
                //if(VERBOSE) println("Matching:", cm, "and", cm2);
                for (let c of cm2.cards) {
                    if (!cm.cards.includes(c)) if (++counter == 2) {
                        found.push(new CardMatch(7, ...cm.cards, ...cm2.cards));
                        if (VERBOSE) println("A \"Full house\" match was found:", found[found.length - 1].cards);
                        break;
                    }
                }
            }
        }

        found.sort((a: CardMatch, b: CardMatch) => (a.rank < b.rank ? 1 : -1)); // Sort for output - IN REVERSE ORDER!

        return found;
    }

    // Flush finder routine
    public static flushFinder(...cards: Card[]): CardMatch[]{
        if(VERBOSE) println("Starting the Flushfinder routine");

        let found: CardMatch[] = new Array<CardMatch>();  // Set up a new return pool

        for(let i = 0; i < 4; i++) {    // For every of the four suits
        let top: number = 0;  // Keep track of the most valued card in the flush

            let same: Card[] = new Array<Card>();  // Set up the place for all the cards of this suit
            for (let c of cards) if (c.getValue() != 1 && Suit.suitSymbols.indexOf(c.getSuit().getName()) == i) {  // If the cards belong
                same.push(c);  // Add them to the group
                top = top > c.getValue() ? top : c.getValue();  // And hypoteticaly raise the most valued card
            }

            if (same.length >= 5) {  // If there are 5 and more
                found.push(new CardMatch(6 + top / 100, ...same));  // Add them as a new "Flush" object
                if (VERBOSE) println("A \"Flush\" match was found:", found[found.length - 1].cards);
            }
        }

        return found;
    }
}