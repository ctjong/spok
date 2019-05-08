import * as io from "socket.io-client";
import Constants from "../constants";
import { SpokMessage, SpokResponse, ErrorResponse } from "../models";

class ClientSocket {
  messageHandlers: ((msg: SpokMessage) => void)[] = [];
  errorHandlers: ((notifCode: number) => void)[] = [];
  disconnectedHandlers: (() => void)[] = [];
  reconnectingHandlers: (() => void)[] = [];
  reconnectedHandlers: (() => void)[] = [];
  initPromise: Promise<any> = null;
  socket: any = null;
  isReconnecting: boolean = false;

  sendMessageEvent(msg: SpokMessage): Promise<SpokResponse> {
    return new Promise(async resolve => {
      // init socket if it's not yet initialized
      if (!this.socket) {
        await this.initSocket();
        if (!this.socket)
          throw new Error("[ClientSocket.send] Failed to initialize socket");
      }
      // send message and check for response status
      console.log("[ClientSocket.send] sending", msg);
      this.socket.emit(
        Constants.eventNames.MSG,
        msg,
        (response: SpokResponse) => {
          console.log("[ClientSocket.send] received", response);
          if (!response.isSuccess) {
            const errorResponse = response as ErrorResponse;
            this.handleError(errorResponse.notifCode);
            throw new Error("[ClientSocket.send] received error");
          }
          resolve(response);
        }
      );
    });
  }

  getSocketId() {
    if (!this.socket) return null;
    return this.socket.id;
  }

  addMessageHandler(handler: (msg: SpokMessage) => void) {
    this.messageHandlers.push(handler);
  }

  addErrorHandler(handler: (code: number) => void) {
    this.errorHandlers.push(handler);
  }

  addDisconnectedHandler(handler: () => void) {
    this.disconnectedHandlers.push(handler);
  }

  addReconnectingHandler(handler: () => void) {
    this.reconnectingHandlers.push(handler);
  }

  addReconnectedHandler(handler: () => void) {
    this.reconnectedHandlers.push(handler);
  }

  close() {
    if (this.socket) this.socket.close();
    this.socket = null;
  }

  handleMessage(msg: SpokMessage) {
    console.log("[ClientSocket.handleMessage] received " + JSON.stringify(msg));
    this.messageHandlers.forEach(handler => handler(msg));
  }

  async handleDisconnect() {
    console.log("[ClientSocket.handleDisconnect]");

    // Try to reconnect
    let elapsed = 0;
    this.socket = null;
    this.isReconnecting = true;
    this.reconnectingHandlers.forEach(handler => handler());
    while (!this.socket && elapsed <= Constants.RECONNECT_TIMEOUT) {
      console.log(
        `[ClientSocket.handleDisconnect] Reconnecting. ${elapsed}ms elapsed.`
      );
      await this.initSocket();
      if (!this.socket) {
        await this.delay(Constants.RECONNECT_INTERVAL);
        elapsed += Constants.RECONNECT_INTERVAL;
      }
    }
    this.isReconnecting = false;
    console.log(
      `[ClientSocket.handleDisconnect] Reconnection success: ${!!this.socket}`
    );

    // Call the appropriate handler, based on whether or not reconnection succeeded
    if (!this.socket) {
      this.disconnectedHandlers.forEach(handler => handler());
    } else {
      this.reconnectedHandlers.forEach(handler => handler());
    }
  }

  handleReconnect() {
    console.log("[ClientSocket.handleReconnect]");
  }

  handleError(notifCode: number) {
    console.log("[ClientSocket.handleError]");
    this.errorHandlers.forEach(handler => handler(notifCode));
  }

  initSocket() {
    if (this.initPromise) return this.initPromise;
    this.initPromise = new Promise(resolve => {
      if (this.socket) {
        this.initPromise = null;
        resolve();
      } else {
        const origin =
          window.location.origin.indexOf("localhost") >= 0
            ? "http://localhost:1337"
            : window.location.origin;

        const socket = io(origin, { reconnection: false });
        socket.on(Constants.eventNames.CONNECT, () => {
          this.socket = socket;
          this.initPromise = null;
          resolve();
        });
        socket.on(Constants.eventNames.CONNECT_ERROR, () => {
          this.handleError(Constants.notifCodes.CONNECT_ERROR);
          this.initPromise = null;
          resolve();
        });
        socket.on(Constants.eventNames.MSG, (msg: SpokMessage) => {
          this.handleMessage(msg);
        });
        socket.on(Constants.eventNames.DISCONNECT, () => {
          this.handleDisconnect();
        });
      }
    });
    return this.initPromise;
  }

  delay(timeout: number) {
    return new Promise(resolve => {
      setTimeout(resolve, timeout);
    });
  }
}

export default ClientSocket;
