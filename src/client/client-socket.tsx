import * as io from "socket.io-client";
import Constants from "../constants";
import { SpokMessage, SpokResponse, ErrorResponse } from "../models";

class ClientSocket {
  messageHandlers: ((msg: SpokMessage) => void)[] = [];
  errorHandlers: ((notifCode: number) => void)[] = [];
  disconnectHandlers: (() => void)[] = [];

  initPromise: Promise<any> = null;
  socket: any = null;

  send(msg: SpokMessage) {
    return new Promise(async resolve => {
      // init socket if it's not yet initialized
      if (!this.socket) {
        await this.initSocket();
        if (!this.socket) throw new Error("[send] Failed to initialize socket");
      }
      // send message and check for response status
      console.log("[send] sending " + JSON.stringify(msg));
      this.socket.emit(
        Constants.eventNames.MSG,
        msg,
        (response: SpokResponse) => {
          console.log("[send] received response " + JSON.stringify(response));
          if (!response.isSuccess) {
            const errorResponse = response as ErrorResponse;
            this.handleError(errorResponse.notifCode);
            throw new Error("[send] received error response. aborting.");
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

  addDisconnectHandler(handler: () => void) {
    this.disconnectHandlers.push(handler);
  }

  close() {
    if (this.socket) this.socket.close();
    this.socket = null;
  }

  handleMessage(msg: SpokMessage) {
    console.log("[handleMessage] received " + JSON.stringify(msg));
    this.messageHandlers.forEach(handler => handler(msg));
  }

  handleDisconnect() {
    console.log("[handleDisconnect]");
    this.socket = null;
    this.disconnectHandlers.forEach(handler => handler());
  }

  handleError(notifCode: number) {
    console.log("[handleError]");
    this.errorHandlers.forEach(handler => handler(notifCode));
  }

  isSocketInitialized() {
    return !!this.socket;
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
}

export default new ClientSocket();
