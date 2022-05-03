import Deck from "./modules/Deck";
import * as dotenv from "dotenv";
import Card from "./modules/Card";
import Suit from "./modules/Suit";
import CardMatch from "./modules/CardMatch";
dotenv.config();
export let VERBOSE = true; // process.env.VERBOSE;

export function println(...items: any) {
    let out: string = "";
    for (let item of items) out += typeof item != "string" ? item.toString() : item;
    console.log(out);
}

let c1: Card = new Card(3, new Suit('H'));
let c2: Card = new Card(3, new Suit('S'));
let c3: Card = new Card(3, new Suit('H'));
let c4: Card = new Card(4, new Suit('D'));
let c5: Card = new Card(5, new Suit('D'));
let c6: Card = new Card(6, new Suit('H'));
let c7: Card = new Card(6, new Suit('S'));

let myDeck: Deck = new Deck(c1, c2, c3, c4, c5, c6, c7);
myDeck.shuffle();
println("\n", CardMatch.match(myDeck));