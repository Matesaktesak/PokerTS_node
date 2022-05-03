import Deck from "./modules/Deck";
import * as dotenv from "dotenv";
dotenv.config();
export let VERBOSE = process.env.VERBOSE;

let myDeck: Deck = new Deck();
println(myDeck);
myDeck.shuffle();
println(myDeck);

export function println(...items: any){
    let out: string = "";
    for(let item of items) out += item.toString();
    console.log(out);
}