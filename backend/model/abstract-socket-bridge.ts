import amqlib, { Channel } from 'amqplib';
import { Socket } from "socket.io";
import { RABBIT_PASSWORD, RABBIT_USERNAME, RABBIT_VHOST, SOCKET_IO_PORT } from "../env";
export abstract class AbstractSocketBridge {
    protected io: Socket;

    protected constructor() {
        this.setupRabbitAmqp();
        this.io = require("socket.io")(SOCKET_IO_PORT, {
            transports: ['websocket'],
            cors: {
                origin: ['localhost:8080', 'localhost:3000']
            }
        })
        this.setup();
    }

    private async setupRabbitAmqp(): Promise<void> {
        console.log("Setting up rabbitmq");
        const connection = await amqlib.connect({ username: RABBIT_USERNAME, password: RABBIT_PASSWORD, vhost: RABBIT_VHOST });

        if (!connection) {
            throw new Error("Failed rabbit connection!");
        }
        // create a channel for data exchange on successfull connection
        const channel = await connection.createChannel();
        if (!channel) {
            throw new Error("Failed rabbit channel creation!");
        }
        this.registerVotePublishQueue(channel);
        this.registerVoteConsumeQueue(channel);
        console.log("Rabbitmq setup complete!");
    }

    private setup(): void {
        this.io.on('connection', (socket: Socket) => {
            this.prepareUserForRooms(socket);
        });
    }

    protected abstract registerVoteConsumeQueue(channel: Channel): void;
    protected abstract registerVotePublishQueue(channel: Channel): void;
    public abstract notifyVotes(buffer: Object | null): void;

    protected abstract prepareUserForRooms(socket: Socket): void;

}