import Deck from "./modules/Deck";
import * as dotenv from "dotenv";
import Card from "./modules/Card";
import Suit from "./modules/Suit";
import CardMatch from "./modules/CardMatch";
dotenv.config();
export let VERBOSE = true; // process.env.VERBOSE;

export function println(...items: any) {
    let out: string = "";
    for (let item of items) out += (typeof(item) != "string" ? item.toString() : item) + " ";
    console.log(out);
}

/*
async function getPost(req: Request){
    let postdata: string = "";
    req.on("data", (chunk) => {
        postdata += chunk.toString();
        if (postdata.length > 1e3) req.socket.destroy(); // Prevent requests over 1kB
    });

    let post: ParsedQs;
    req.on("end", () => {
        post = qs.parse(postdata);
        if (VERBOSE) console.log("New post arrived:" + JSON.stringify(post));

    });

    return post;
}
*/

import express from "express";
import { Request, Response, NextFunction } from "express";
//import api from "./api";
//import middleware from "./middleware";
import websockets from './websockets';
import Poker from "./modules/Poker";
import { parse } from "url";
import PokerGame from "./modules/Poker";
import fs from "fs";
import qs, { ParsedQs } from "qs";
import Player from "./modules/Player";

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
let games: PokerGame[] = new Array<PokerGame>();

app.get("/progress", async (req: Request, res: Response, next: NextFunction) => {
    let postdata: string = "";
    req.on("data", (chunk) => {
        postdata += chunk.toString();
        if (postdata.length > 1e3) req.socket.destroy(); // Prevent requests over 1kB
    });

    let post: ParsedQs;
    req.on("end", () => {
        post = qs.parse(postdata);

        let game = games.find((element) => element.id() == post.gameId);
        if(game) game.progress(); else println("No game with this ID...");

        res.status(200).send(JSON.stringify({gameId: game?.id(), gameState: game?.state()}));
    });

    
    //next();
});

app.post("/newgame", async (req: Request, res: Response, next: NextFunction) => {
    let postdata: string = "";
    req.on("data", (chunk) => {
        postdata += chunk.toString();
        if (postdata.length > 1e3) req.socket.destroy(); // Prevent requests over 1kB
    });

    let post: ParsedQs;
    req.on("end", () => {
        post = qs.parse(postdata);
        let id = PokerGame.makeid();
        if (typeof post.gameId == "string") id = post.gameId;

        while (games.find((element) => element.id() == id)) id = PokerGame.makeid();
        games.push(new PokerGame(id).start());

        res.status(200).send(JSON.stringify({ gameId: id }));

        next();
    });
});

app.post("/join/:id", async(req: Request, res: Response, next: NextFunction) => {
    let id = req.params["id"];
    let game = games.find((element) => element.id() === id);
    game?.addPlayer(new Player(game));
    //println("Player joined game", id);

    res.sendStatus(200);
});

const server = app.listen(port, () => {
    if (process.send) {
        process.send(`Server running at http://localhost:${port}\n\n`);
    }
});

websockets(server, games);










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

