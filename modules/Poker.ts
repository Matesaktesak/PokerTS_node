import { println } from "../app";
import Player from "./Player";

export default class Poker{
    private gameId: number;
    private players: Player[] = new Array<Player>();

    constructor(gameId: number){
        this.gameId = gameId;
    }

    public progress(){
        println("Game", this.gameId, "has progressed");
    }
}