import {AbstractServerClientNotification} from "../model/AbstractServerClientNotification";
import {DailyVoting} from "../../frontend/src/models/voting";
import ws from "ws";

export class WebSocketNotificationImpl extends AbstractServerClientNotification {

    private clients: ws[] = [];

    constructor(private wsServer: ws.Server) {
        super();
        this.wsServer.on("connection", (socket, request) => {
            this.clients.push(socket);
        })
        this.wsServer.on("close", (socket: ws, request: any) => {
            this.clients = this.clients.filter(e => e != socket);
        })
    }

    protected notifyUsers(voting: DailyVoting): void {
        console.log("Notifying users for new votings!");
        this.clients.forEach(c => c.send(JSON.stringify(voting)));
    }
}
