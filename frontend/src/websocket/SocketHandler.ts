export class SocketHandler {
    private voteSocket: WebSocket;

    constructor(_socketURI: string) {
        console.warn(_socketURI);
        this.voteSocket = new WebSocket(_socketURI + "/socket");
    }

    public registerVoteListener(consumer: (voting: MessageEvent) => void): void {
        this.voteSocket.addEventListener("message", consumer as any);
    }

}
