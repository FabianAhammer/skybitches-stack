export class SocketHandler {
  private voteSocket: WebSocket;

  constructor(_socketURI: string) {
    this.voteSocket = new WebSocket(_socketURI + "/socket");
  }

  public registerWebSocketMessageListener(consumer: (voting: MessageEvent) => void): void {
    this.voteSocket.addEventListener("message", consumer as any);
  }

}
