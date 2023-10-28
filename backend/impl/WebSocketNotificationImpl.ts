import {AbstractServerClientNotification} from "../model/AbstractServerClientNotification";
import {DailyOrder, DailyVoting} from "../../frontend/src/models/base_types";
import ws from "ws";
import {WithId} from "mongodb";
import {IncomingMessage} from "http";

export class WebSocketNotificationImpl extends AbstractServerClientNotification {

    private clients: ws[] = [];

    constructor(private wsServer: ws.Server) {
        super();
        this.wsServer.on("connection", (socket, _: IncomingMessage) => {
            this.clients.push(socket);
        })
        this.wsServer.on("close", (socket: ws, _: IncomingMessage) => {
            this.clients = this.clients.filter(e => e != socket);
        })
    }

    protected notifyUsers(data: { voting?: WithId<DailyVoting>, orders?: WithId<DailyOrder> }): void {
        this.clients.forEach(c => c.send(JSON.stringify(data)));
    }

}
