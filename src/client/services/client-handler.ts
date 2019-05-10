import {
  StateRequestMessage,
  RoomUpdateMessage,
  SpokMessage,
  ChatMessage,
  StateResponse
} from "../../models";
import constants from "../../constants";
import clientSocket from "./client-socket";
import { ViewBase } from "../view-base";
import { History } from "history";
import util from "../../util";
import navigationService from "./navigation-service";

class ClientHandler {
  activeView: ViewBase<any, any> = null;
  history: History = null;
  userName: string = null;
  roomCode: string = null;
  isReconnecting: boolean = false;

  constructor() {
    this.userName = sessionStorage.getItem(constants.USER_NAME_SSKEY);
    this.roomCode = sessionStorage.getItem(constants.ROOM_CODE_SSKEY);
    clientSocket.addDisconnectedHandler(() => this.handleDisconnected());
    clientSocket.addReconnectingHandler(() => this.handleReconnecting());
    clientSocket.addReconnectedHandler(() => this.handleReconnected());
    clientSocket.addErrorHandler((code: string) => this.handleError(code));
    clientSocket.addMessageHandler((msg: SpokMessage) =>
      this.handleMessage(msg)
    );
  }

  getRoomState() {
    if (!this.activeView.isRoomView || !this.activeView.state) return null;
    return this.activeView.state.room;
  }

  isHostUser() {
    const roomState = this.getRoomState();
    return roomState && this.userName === roomState.hostUserName;
  }

  async refreshState() {
    if (!this.activeView.isRoomView) {
      this.exitRoom(constants.notifCodes.UNKNOWN_ERROR);
      return;
    }
    this.activeView.showNotifUI(constants.notifCodes.SYNCING_STATE);
    const response: StateResponse = (await clientSocket.send(
      new StateRequestMessage(this.roomCode, this.userName)
    )) as StateResponse;
    if (!this.activeView.isRoomView) return;
    this.activeView.hideNotifUI();
    this.activeView.updateRoomState(response.state);
  }

  exitRoom(reasonCode: string) {
    console.log(`[ClientHandler.exitRoom] Reason: ${reasonCode}`);
    // TODO: set activeNotifCode state
    if (this.activeView.isRoomView) this.activeView.disablePrompt();
    sessionStorage.setItem(constants.USER_NAME_SSKEY, null);
    sessionStorage.setItem(constants.ROOM_CODE_SSKEY, null);
    clientSocket.close();
    if (navigationService.history.location.pathname !== constants.HOME_PATH)
      navigationService.goTo(constants.HOME_PATH);
  }

  handeRoomUpdate(msg: RoomUpdateMessage) {
    const newRoomState = msg.newRoomState;
    const existingPlayer = newRoomState.players[this.userName];
    if (
      !existingPlayer ||
      clientSocket.getSocketId() !== existingPlayer.socketId
    )
      this.exitRoom(constants.notifCodes.PLAYER_KICKED);
    else if (this.activeView.isRoomView)
      this.activeView.updateRoomState(msg.newRoomState);
  }

  handleDisconnected() {
    console.log("[ClientHandler.handleDisconnected]");
    if (!this.activeView.isRoomView) return;
    this.exitRoom(constants.notifCodes.CLIENT_DISCONNECTED);
  }

  handleReconnecting() {
    console.log("[ClientHandler.handleReconnecting]");
    if (!this.activeView.isRoomView) return;
    this.activeView.showNotifUI(constants.notifCodes.RECONNECTING);
  }

  handleReconnected() {
    console.log("[ClientHandler.handleReconnected]");
    if (!this.activeView.isRoomView) return;
    this.refreshState();
  }

  handleError(notifCode: string) {
    if (
      !clientSocket.isReconnecting &&
      constants.fatalErrors.indexOf(notifCode) >= 0
    ) {
      console.log("[ClientHandler.handleError] Fatal error received");
      this.exitRoom(notifCode);
    }
  }

  handleMessage(msg: SpokMessage) {
    if (msg.type === constants.msgTypes.ROOM_UPDATE) {
      this.handeRoomUpdate(msg as RoomUpdateMessage);
    } else if (
      msg.type === constants.msgTypes.CHAT_MESSAGE &&
      this.activeView.isRoomView
    ) {
      this.activeView.chatBox.pushMessage(msg as ChatMessage);
    }
  }
}

export default new ClientHandler();
