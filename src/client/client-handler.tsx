import {
  StateRequestMessage,
  RoomUpdateMessage,
  SpokMessage,
  ChatMessage,
  StateResponse
} from "../models";
import Constants from "../constants";
import ClientSocket from "./client-socket";
import { ViewBase } from "./view-base";
import { History } from "history";

class ClientHandler {
  activeView: ViewBase<any, any> = null;
  history: History = null;
  userName: string = null;
  roomCode: string = null;
  lastNotifCode: number = null;
  isReconnecting: boolean = false;
  clientSocket: ClientSocket = null;

  constructor() {
    this.clientSocket = new ClientSocket();
    this.userName = sessionStorage.getItem(Constants.USER_NAME_SSKEY);
    this.roomCode = sessionStorage.getItem(Constants.ROOM_CODE_SSKEY);
    this.clientSocket.addDisconnectedHandler(() => this.handleDisconnected());
    this.clientSocket.addReconnectingHandler(() => this.handleReconnecting());
    this.clientSocket.addReconnectedHandler(() => this.handleReconnected());
    this.clientSocket.addErrorHandler((code: number) => this.handleError(code));
    this.clientSocket.addMessageHandler((msg: SpokMessage) =>
      this.handleMessage(msg)
    );
  }

  goTo(path: string) {
    this.history.push(path);
  }

  initHistory(history: History) {
    this.history = history;
    history.listen(location => {
      if (location.pathname.indexOf("/room") !== 0 && this.getRoomState())
        this.exitRoom(Constants.notifCodes.UNKNOWN_ERROR);
      if (location.pathname !== Constants.HOME_PATH) this.lastNotifCode = null;
    });
  }

  getRoomState() {
    if (!this.activeView.isRoomView || !this.activeView.state) return null;
    return this.activeView.state.room;
  }

  isHostUser() {
    const roomState = this.getRoomState();
    return roomState && this.userName === roomState.hostUserName;
  }

  setUserName(value: string) {
    this.userName = value;
    sessionStorage.setItem(Constants.USER_NAME_SSKEY, value);
  }

  setRoomCode(value: string) {
    this.roomCode = value;
    sessionStorage.setItem(Constants.ROOM_CODE_SSKEY, value);
  }

  async refreshState() {
    if (!this.activeView.isRoomView) {
      this.exitRoom(Constants.notifCodes.UNKNOWN_ERROR);
      return;
    }
    this.activeView.showNotifUI(Constants.notifCodes.SYNCING_STATE);
    const response: StateResponse = (await this.send(
      new StateRequestMessage(this.roomCode, this.userName)
    )) as StateResponse;
    if (!this.activeView.isRoomView) return;
    this.activeView.hideNotifUI();
    this.activeView.updateRoomState(response.state);
  }

  getRandomCode() {
    return Math.floor((1 + Math.random()) * 0x1000000000).toString(16);
  }

  exitRoom(reasonCode: number) {
    console.log(`[ClientHandler.exitRoom] Reason: ${reasonCode}`);
    this.lastNotifCode = reasonCode;
    if (this.activeView.isRoomView) this.activeView.disablePrompt();
    sessionStorage.setItem(Constants.USER_NAME_SSKEY, null);
    sessionStorage.setItem(Constants.ROOM_CODE_SSKEY, null);
    this.clientSocket.close();
    if (this.history.location.pathname !== Constants.HOME_PATH)
      this.goTo(Constants.HOME_PATH);
  }

  handeRoomUpdate(msg: RoomUpdateMessage) {
    const newRoomState = msg.newRoomState;
    const existingPlayer = newRoomState.players[this.userName];
    if (
      !existingPlayer ||
      this.clientSocket.getSocketId() !== existingPlayer.socketId
    )
      this.exitRoom(Constants.notifCodes.PLAYER_KICKED);
    else if (this.activeView.isRoomView)
      this.activeView.updateRoomState(msg.newRoomState);
  }

  handleDisconnected() {
    console.log("[ClientHandler.handleDisconnected]");
    if (!this.activeView.isRoomView) return;
    this.exitRoom(Constants.notifCodes.CLIENT_DISCONNECTED);
  }

  handleReconnecting() {
    console.log("[ClientHandler.handleReconnecting]");
    if (!this.activeView.isRoomView) return;
    this.activeView.showNotifUI(Constants.notifCodes.RECONNECTING);
  }

  handleReconnected() {
    console.log("[ClientHandler.handleReconnected]");
    if (!this.activeView.isRoomView) return;
    this.refreshState();
  }

  handleError(notifCode: number) {
    if (
      !this.clientSocket.isReconnecting &&
      Constants.fatalErrors.indexOf(notifCode) >= 0
    ) {
      console.log("[ClientHandler.handleError] Fatal error received");
      this.exitRoom(notifCode);
    }
  }

  handleMessage(msg: SpokMessage) {
    if (msg.type === Constants.msgTypes.ROOM_UPDATE) {
      this.handeRoomUpdate(msg as RoomUpdateMessage);
    } else if (
      msg.type === Constants.msgTypes.CHAT_MESSAGE &&
      this.activeView.isRoomView
    ) {
      this.activeView.chatBox.pushMessage(msg as ChatMessage);
    }
  }

  send(msg: SpokMessage) {
    return this.clientSocket.sendMessageEvent(msg);
  }
}

export default new ClientHandler();
