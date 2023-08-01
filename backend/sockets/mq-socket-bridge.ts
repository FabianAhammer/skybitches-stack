import { Socket } from "socket.io";
import { SkybitchesRouter } from "../model/abstract-skybitches-router";
import { AbstractSocketBridge } from "../model/abstract-socket-bridge";
import { Channel, Message } from "amqplib";


export class MqSocketBridge extends AbstractSocketBridge {

    private voteRoom = "vote-room";

    constructor(mainRouter: SkybitchesRouter) {
        super(mainRouter);
    }

    protected prepareUserForRooms(socket: Socket): void {
        //Vote room sends to all io clients.
        socket.join(this.voteRoom);
    }

    protected registerVoteConsumeQueue(channel: Channel): void {
        channel.consume('vote-queue', (message) => {
            this.io.to(this.voteRoom).emit('SUBSCRIBE', `Received: ${JSON.stringify(message)}`)
            channel.ack(message as Message);
        })
    }


}