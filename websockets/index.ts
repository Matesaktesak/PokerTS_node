import WebSocket, { WebSocketServer } from "ws";
import queryString from "query-string";

export default async (websrv: any) => {
    const ws : WebSocketServer= new WebSocket.Server({
        noServer: true,
        path: "/websockets",
    });

    websrv.on("upgrade", (req: any, soc: any, head: any) => {
        ws.handleUpgrade(req, soc, head, (websocket: any) => {
            websocket.emit("connection", websocket, req);
        });
    });
    console.log(ws);

    ws.on("connection", (con: any, req: any) => {
        const [path, params] = req?.url?.split("?");
        const connectionParams = queryString.parse(params);
        console.log("connection");
        console.log(connectionParams);

        con.on("message", (msg: any) => {
            const parsedMsg = JSON.parse(msg);
            console.log(parsedMsg);
            con.send(JSON.stringify({"message": msg}));
        });
    });

    return ws;
}