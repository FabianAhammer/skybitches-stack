import {AbstractServerClientNotification} from "../model/AbstractServerClientNotification";
import {DailyOrder, DailyVoting, Order} from "../../frontend/src/models/voting";
import ws from "ws";
import {WithId} from "mongodb";

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

    protected notifyUsers(data: { voting?: WithId<DailyVoting>, orders?: WithId<DailyOrder> }): void {
        this.clients.forEach(c => c.send(JSON.stringify(data)));
    }

}
