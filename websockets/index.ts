import WebSocket, { WebSocketServer } from "ws";
import { parse }from "url";
import { println, VERBOSE } from "../app";
import { IncomingMessage, Server } from "http";
import PokerGame from "../modules/Poker";
import Player from "../modules/Player";

export type PokerProtocolMessage = {
    gameId: string,
    action: string,
    args?: {
        ammount?: number,
        name?: string,
    }
}

export type PokerProtocolStatus = {
    action: string,
    description?: string,
    money?: number,
    cards?: object[],
    community?: object[],
    pot?: number
}

export default async (websrv: Server, games: PokerGame[]) => {
    const wss : WebSocketServer = new WebSocketServer({ noServer: true });

    wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
        println("Connection from", req.url);

        ws.on("message", (msg: any) => {
            const parsedMsg:PokerProtocolMessage = JSON.parse(msg);
            //println(JSON.stringify(parsedMsg));

            let game: PokerGame | undefined = games.find((element) => element.id() == parsedMsg.gameId);
            if(game == undefined) throw new Error("No such game!");

            let args = parsedMsg.args;
            if(VERBOSE) println("Incoming WS args:", JSON.stringify(args));
            
            switch(parsedMsg.action){
                case "join":
                    try{ game.addPlayer(new Player(game, ws, args?.name)); } catch { console.log("Invalid join attempt"); }
                    ws.send(JSON.stringify({action: "success"}));
                    break;
                case "setName":
                    game.getPlayerBySocket(ws).name = args?.name || "";
                    break;
                case "bet":
                    try{
                        game.getPlayerBySocket(ws).placeBet(args?.ammount).nextPlayer()?.startBet();

                        for(let c of wss.clients) c.send(JSON.stringify({
                            action: "update",
                            pot: game.pot()
                        }));

                        if(game.active == null) game.progress();
                    } catch {
                        game.active?.startBet();
                    }
                    break;
                case "nudgeMoney":
                    game.getPlayerBySocket(ws).nudgeMoney(args?.ammount || 0);
                    break;
            }
            //for(let i: number = 0; i < 5; i++) ws.send(JSON.stringify({message: msg, number: i}));
        });

        ws.on("close", (code: number, reason: string) => {
            let game = games.find((el1) => el1.getPlayerBySocket(ws));
            game?.removePlayer(game.getPlayerBySocket(ws));
        });
    });

    websrv.on("upgrade", (req: any, soc: any, head: any) => {
        const {pathname} = parse(req.url);
        println("Incoming WS request on:", pathname);

        if(pathname === "/protocol") wss.handleUpgrade(req, soc, head, (websocket: any) => {
            wss.emit("connection", websocket, req);
        }); else soc.destroy();
    });

    return wss;
}