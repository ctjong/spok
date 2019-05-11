import * as io from "socket.io-client";
import constants from "../../constants";
import { SpokMessage, SpokResponse, ErrorResponse } from "../../models";

export type SocketMessageHandler = (msg: SpokMessage) => void;
export type SocketErrorHandler = (notifCode: string) => void;
export type SocketDisconnectHandler = () => void;

class ClientSocket {
  messageHandlers: SocketMessageHandler[] = null;
  errorHandlers: SocketErrorHandler[] = null;
  disconnectHandlers: SocketDisconnectHandler[] = null;
  initPromise: Promise<any> = null;
  socket: any = null;
  isReconnecting: boolean = false;
  isClosed: boolean = false;

  constructor() {
    this.connect();
  }

  connect() {
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
        socket.on(constants.eventNames.CONNECT, () => {
          this.socket = socket;
          this.initPromise = null;
          this.isClosed = false;
          resolve();
        });
        socket.on(constants.eventNames.CONNECT_ERROR, () => {
          this.handleError(constants.notifCodes.CONNECT_ERROR);
          this.initPromise = null;
          this.isClosed = false;
          resolve();
        });
        socket.on(constants.eventNames.MSG, (msg: SpokMessage) => {
          this.handleMessage(msg);
        });
        socket.on(constants.eventNames.DISCONNECT, () => {
          this.handleDisconnect();
        });
      }
    });
    return this.initPromise;
  }

  send(msg: SpokMessage): Promise<SpokResponse> {
    return new Promise(async resolve => {
      // init socket if it's not yet connected
      if (!this.socket) {
        await this.connect();
        if (!this.socket) {
          throw new Error("[ClientSocket.send] Failed to establish connection");
        }
      }
      // send message and check for response status
      console.log("[ClientSocket.send] sending", msg);
      this.socket.emit(
        constants.eventNames.MSG,
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

  addMessageHandler(handler: SocketMessageHandler) {
    this.messageHandlers.push(handler);
  }

  addErrorHandler(handler: SocketErrorHandler) {
    this.errorHandlers.push(handler);
  }

  addDisconnectHandler(handler: SocketDisconnectHandler) {
    this.disconnectHandlers.push(handler);
  }

  getSocketId() {
    if (!this.socket) return null;
    return this.socket.id;
  }

  // Close the socket instance. This will disable all socket functionality except send(),
  // which will re-open a new socket.
  close() {
    if (this.socket) this.socket.close();
    this.socket = null;
    this.isClosed = true;
  }

  handleMessage(msg: SpokMessage) {
    console.log("[ClientSocket.handleMessage] received " + JSON.stringify(msg));
    this.messageHandlers.forEach(handler => handler(msg));
  }

  async handleDisconnect() {
    console.log("[ClientSocket.handleDisconnect]");
    this.socket = null;
    this.disconnectHandlers.forEach(handler => handler());
  }

  handleError(notifCode: string) {
    console.log("[ClientSocket.handleError]");
    this.errorHandlers.forEach(handler => handler(notifCode));
  }

  // Try to reconnect, and return whether or not it is successful. This should return false
  // if the instance has been closed.
  async reconnect() {
    if (this.isClosed) {
      return false;
    }

    let elapsed = 0;
    this.isReconnecting = true;
    while (!this.socket && elapsed <= constants.RECONNECT_TIMEOUT) {
      console.log(
        `[ClientSocket.reconnect] Reconnecting. ${elapsed}ms elapsed.`
      );
      await this.connect();
      if (!this.socket) {
        await this.delay(constants.RECONNECT_INTERVAL);
        elapsed += constants.RECONNECT_INTERVAL;
      }
    }
    this.isReconnecting = false;
    console.log(
      `[ClientSocket.reconnect] Reconnection success: ${!!this.socket}`
    );

    return !!this.socket;
  }

  delay(timeout: number) {
    return new Promise(resolve => {
      setTimeout(resolve, timeout);
    });
  }
}

export default new ClientSocket();
