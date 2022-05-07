import Deck from "./modules/Deck";
import * as dotenv from "dotenv";
import Card from "./modules/Card";
import Suit from "./modules/Suit";
import CardMatch from "./modules/CardMatch";
dotenv.config();
export let VERBOSE = true; // process.env.VERBOSE;

export function println(...items: any) {
    let out: string = "";
    for (let item of items) out += typeof item != "string" ? item.toString() : item + " ";
    console.log(out);
}



import express from "express";
import { Request, Response, NextFunction } from "express";
//import api from "./api";
//import middleware from "./middleware";
import websockets from './websockets';
import Poker from "./modules/Poker";
import { parse } from "url";

const app = express();
app.disable('query parser');
app.use(express.query({}));

const port: number = Number(process.env.PORT) || 8080;

//middleware(app);
//api(app);


app.get("/", (req: Request, res: Response, next: NextFunction) => {
    res.send(`<a href="/progress">Progress</a>`);
});

//app.get("/websockets", (req: any, res: any, next: any) => {

//});
let games: Poker[] = new Array<Poker>();

app.get("/progress", (req: Request, res: Response, next: NextFunction) => {
    const gameID = req.params;
    console.log(req.query.gameID);

    try{
        games[req.query.gameID].progress();
    }catch{
        println("No game with this ID...");
    }

    res.sendStatus(200);

    next();
});

app.post("/newgame", (req: Request, res: Response, next: NextFunction) => {
    games.push(new Poker(games.length));

    //res.sendStatus(200);
    res.send("New gameID:" + games.length);

    next();
});

const server = app.listen(port, () => {
    if (process.send) {
        process.send(`Server running at http://localhost:${port}\n\n`);
    }
});

websockets(server);

/*
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
*/