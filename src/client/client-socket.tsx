import * as io from "socket.io-client";
import Constants from "../constants";
import { SpokMessage } from "../models";

class ClientSocket {
  messageHandlers: ((msg: SpokMessage) => void)[] = [];
  errorHandlers: ((notifCode: number) => void)[] = [];
  disconnectHandlers: (() => void)[] = [];
  reconnectHandlers: (() => void)[] = [];

  initPromise: Promise<any> = null;
  socket: any = null;

  send(msg: SpokMessage) {
    return new Promise(resolve => {
      // prepare timeout timer
      let isTimedOut = false;
      const timer = setTimeout(() => {
        console.log("[send] request timed out. aborting.");
        isTimedOut = true;
        this.handleError(Constants.notifCodes.REQUEST_TIMEOUT);
      }, Constants.REQUEST_TIMEOUT);

      // init socket then fire request
      this.initSocket().then(() => {
        if (!this.socket) return;

        console.log("[send] sending " + JSON.stringify(msg));
        this.socket.emit(Constants.eventNames.MSG, msg, (response: any) => {
          if (isTimedOut) {
            console.log("[send] response received after timeout. ignoring.");
            return;
          }
          console.log("[send] received response " + JSON.stringify(response));
          clearTimeout(timer);
          if (!response.isSuccessStatusCode) resolve(response);
        });
      });
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

  addReconnectHandler(handler: () => void) {
    this.reconnectHandlers.push(handler);
  }

  close() {
    if (this.socket) this.socket.close();
    this.socket = null;
    this.initPromise = null;
  }

  //-------------------------------------------
  // PRIVATE FUNCTIONS
  //-------------------------------------------

  handleMessage = (msg: SpokMessage) => {
    console.log("[handleMessage] received " + JSON.stringify(msg));
    this.messageHandlers.forEach(handler => handler(msg));
  };

  handleConnect = (callback: () => void) => {
    console.log("[handleConnect]");
    callback();
  };

  handleDisconnect() {
    console.log("[handleDisconnect]");
    this.disconnectHandlers.forEach(handler => handler());
  }

  handleReconnect() {
    console.log("[handleReconnect]");
    this.reconnectHandlers.forEach(handler => handler());
  }

  handleError(notifCode: number) {
    console.log("[handleError]");
    this.errorHandlers.forEach(handler => handler(notifCode));
  }

  initSocket() {
    if (this.initPromise) return this.initPromise;
    this.initPromise = new Promise(resolve => {
      if (this.socket) {
        resolve();
        return;
      }
      const origin =
        window.location.origin.indexOf("localhost") >= 0
          ? "http://localhost:1337"
          : window.location.origin;
      this.socket = io(origin);
      this.socket.on(Constants.eventNames.MSG, (msg: SpokMessage) =>
        this.handleMessage(msg)
      );
      this.socket.on(Constants.eventNames.CONNECT, () =>
        this.handleConnect(resolve)
      );
      this.socket.on(Constants.eventNames.DISCONNECT, () =>
        this.handleDisconnect()
      );
      this.socket.on(Constants.eventNames.RECONNECT, () =>
        this.handleReconnect()
      );
      this.socket.on(Constants.eventNames.CONNECT_ERROR, () =>
        this.handleError(Constants.notifCodes.CONNECT_ERROR)
      );
    });
    return this.initPromise;
  }
}

export default new ClientSocket();
