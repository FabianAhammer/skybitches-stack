import { Socket } from "socket.io";
import { AbstractSocketBridge } from "../model/abstract-socket-bridge";
import { Channel, Message } from "amqplib";
import { RABBIT_VOTE_QUEUE } from "../env";


export class MqSocketBridge extends AbstractSocketBridge {
    private voteRoom = "vote-room";
    private votePublishChannel: Channel;

    constructor() {
        super();
        console.log("Socket bride created")
    }

    protected prepareUserForRooms(socket: Socket): void {
        //Vote room sends to all io clients.
        socket.join(this.voteRoom);
    }

    protected registerVoteConsumeQueue(channel: Channel): void {
        channel.consume(RABBIT_VOTE_QUEUE, (message) => {
            if (!message) {
                console.error("No message received!");
                return;
            }
            this.io.to(this.voteRoom).emit('SUBSCRIBE', JSON.parse(message.content.toString()))
            channel.ack(message as Message);
        })
    }

    protected registerVotePublishQueue(channel: Channel): void {
        this.votePublishChannel = channel;
    }

    public notifyVotes(message: Object | null) {
        if (message === null) { return }
        const buffer = Buffer.from(JSON.stringify(message));
        this.votePublishChannel.sendToQueue(RABBIT_VOTE_QUEUE, buffer);
    }

}