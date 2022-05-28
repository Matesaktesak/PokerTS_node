import { platform } from "os";
import { println, VERBOSE } from "../app";
import CardMatch from "./CardMatch";
import Community from "./Community";
import Deck from "./Deck";
import Player from "./Player";
import WebSocket from "ws";

export default class PokerGame{
    private gameId: string;
    private players: Player[] = new Array<Player>();
    private maxPlayers: number = 10;

    private community: Community;
    private deck: Deck;

    public active: Player | null = null;

    constructor(gameId: string){
        this.gameId = gameId.toLowerCase();
        this.community = new Community(this);
        this.deck = new Deck();

        if(VERBOSE) println("Game with ID:", this.gameId, "has been created with a new deck containing", this.deck.length(), "cards and new empty community space");
    }

    public id(): string{ return this.gameId; }
    public state(): string { return this.community.deal; }

    public start(): PokerGame{
        println("The game", this.gameId, "is starting");

        this.deck.shuffle();
        println("The deck", this.deck, "has been thoroughly shuffled");
        return this;
    }

    public stop(reason: string): void{
        println("Game", this.gameId, "has been stoped due to", reason);
        this.destroy();
        return;
    }

    public destroy(): void{
        // TODO: Write a destructor
    }

    public addPlayer(player: Player): PokerGame {   // Player setter
        if(this.community.deal === "Start"){
            this.players.push(player);
            if(VERBOSE) println(player, "was added to", this.gameId);
            return this;
        } else {
            println("Can't add a player at this stage of the game!");
            throw new Error("Can't add a player at this point in the game!");
        }
    }

    public removePlayer(player: Player): PokerGame {
        this.players.splice(this.players.indexOf(player),1);
        return this;
    }

    public nextPlayer(current: Player | null = this.active): Player | null{
        if(current == null) current = this.players[0];
        let next: number = this.players.indexOf(current) + 1;
        if(next >= this.players.length) return null;

        if(VERBOSE) println("The next player is number", next + 1, "of", this.players.length);
        this.active = this.players[next];
        return this.active;
    }

    public playerCount(): number { return this.players.length; }
    public getMaxPlayers(): number { return this.maxPlayers; }
    public setMaxPlayers(c: number): number {
        this.maxPlayers = c;
        return this.maxPlayers;
    }


    public progress(): PokerGame{
        if(VERBOSE) println("Game", this.gameId, "has progressed");

        switch(this.community.deal){
            case "Start":
                this.handOut(this.deck);
                this.handOut(this.deck);
                this.bet();
                break;
            case "HandOut":
                this.community.flop(this.deck);
                this.bet();
                break;
            case "Flop":
                this.community.turn(this.deck);
                this.bet();
                break;
            case "Turn":
                this.community.river(this.deck);
                this.bet();
                break;
            case "River":
                this.showdown();
                break;
            case "Showdown":
                this.stop("Game end");
                break;
        }

        return this;
    }

    private bet(): PokerGame{
        this.active = this.players[0];
        this.active?.startBet();
        return this;
    }

    public ante(ammount: number): PokerGame{
        this.community.money += ammount;
        return this;
    }

    private handOut(deck: Deck): PokerGame{
        this.community.deal = "HandOut";
        for(let player of this.players) player.dealCard(deck);
        if(VERBOSE) println("A card was handed out from", deck, "to every player in game", this.gameId);
        return this;
    }

    private showdown(): void {
        this.community.deal = "Showdown";

        if (VERBOSE) println("\n--------------- SHOWDOWN ---------------");
        if (VERBOSE) println("Current state of the community:", this.community);
        if (VERBOSE) println("Current state of the hands:");
        if (VERBOSE) for(let player of this.players) println("\t-", player.toString());

        if (VERBOSE) println("--------- Let the matching begin ---------");
        for (let p of this.players) {
            let matchSet = new Deck().flush();
            matchSet.merge(p);
            matchSet.merge(this.community);

            p.matches = CardMatch.match(matchSet);
            println(p.matches, "\n");
        }

        this.players.sort((p1, p2) => {
            let result: number = 0;

            let m1 = new Array<CardMatch>(...p1.matches);
            let m2 = new Array<CardMatch>(...p2.matches);

            while(result == 0 && m1.length && m2.length) {
                let max1 = m1[0].rank;
                let max2 = m2[0].rank;

                if (max1 > max2) result = -1; else if (max1 < max2) result = 1;

                m1.splice(0,1);
                m2.splice(0,1);
            }

            if (!m1 && m2) result = 1;
            if (!m2 && m1) result = -1;

            return result;
        });

        if(VERBOSE) println("--------- The finale ---------");
        if(VERBOSE) println(this.community);
        if(VERBOSE) println(this.players);
    }

    public static makeid(): string {
        let id: string = "";

        let symbols: string = 'abcdefghijklmnopqrstuvwxyz';
        for (let i: number = 0; i < 6; i++) id += symbols.charAt(Math.floor(Math.random() * symbols.length));

        return id;
    }

    public getPlayerBySocket(ws: WebSocket): Player{
        let p = this.players.find((element) => element.socket == ws);
        if(p == undefined) throw new Error("No such player exists!");
        return p;
    }

    public getPlayers(): Player[]{
        return this.players;
    }

    public pot(): number{
        return this.community.money;
    }
}