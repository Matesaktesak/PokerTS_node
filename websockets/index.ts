import { WebSocketServer } from "ws";
import { parse }from "url";
import { println } from "../app";
import { IncomingMessage } from "http";

export default async (websrv: any) => {
    const wss : WebSocketServer = new WebSocketServer({ noServer: true });

    wss.on("connection", (ws: any, req: IncomingMessage) => {
        println("Connection from", req.url);

        ws.on("message", (msg: any) => {
            const parsedMsg = JSON.parse(msg);
            println(JSON.stringify(parsedMsg));
            //for(let i: number = 0; i < 5; i++) ws.send(JSON.stringify({message: msg, number: i}));
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