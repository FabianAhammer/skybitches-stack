import { Socket } from "socket.io";
import { RABBIT_PASSWORD, RABBIT_USERNAME, RABBIT_VHOST, SOCKET_IO_PORT } from "../env";
import { SkybitchesRouter } from "./abstract-skybitches-router";
import amqlib, { Channel } from 'amqplib'

export abstract class AbstractSocketBridge {

    protected io: Socket;

    protected constructor(private mainRouter: SkybitchesRouter) {
        this.io = require("socket.io")(SOCKET_IO_PORT, {
            transports: ['websocket'],
            cors: {
                origin: ['localhost:8080', 'localhost:3000']
            }
        })
        this.setup();
    }

    private setup(): void {
        this.io.on('connection', (socket: Socket) => {
            this.prepareUserForRooms(socket);
            amqlib.connect({ username: RABBIT_USERNAME, password: RABBIT_PASSWORD, vhost: RABBIT_VHOST }, (err0: any, connection: any) => {
                if (err0) {
                    throw err0
                }
                // create a channel for data exchange on successfull connection
                connection.createChannel((err1: any, channel: Channel) => {
                    if (err1) {
                        throw err1
                    }
                    this.registerVoteConsumeQueue(channel);
                })
            })
        });
    }

    protected abstract registerVoteConsumeQueue(channel: Channel): void;
    protected abstract prepareUserForRooms(socket: Socket): void;

}