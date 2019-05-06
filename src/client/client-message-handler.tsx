import { StateRequestMessage, RoomUpdateMessage, Message } from "../models";
import Constants from "../constants";
import ClientSocket from "./client-socket";
import ViewBase from "./view-base";
import { History } from "history";

class ClientHandler {
  activeView: ViewBase = null;
  history: History = null;
  userName: string = null;
  roomCode: string = null;
  lastNotifCode: number = null;

  constructor() {
    this.userName = sessionStorage.getItem(Constants.USER_NAME_SSKEY);
    this.roomCode = sessionStorage.getItem(Constants.ROOM_CODE_SSKEY);
    ClientSocket.addDisconnectHandler(this.handleThisPlayerDC);
    ClientSocket.addReconnectHandler(this.handleThisPlayerRC);
    ClientSocket.addErrorHandler(this.handleError);
    ClientSocket.addMessageHandler(this.handleMessage);
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
    console.log(`setting current userName to ${value}`);
    this.userName = value;
    sessionStorage.setItem(Constants.USER_NAME_SSKEY, value);
  }

  setRoomCode(value: string) {
    console.log(`setting current roomCode to ${value}`);
    this.roomCode = value;
    sessionStorage.setItem(Constants.ROOM_CODE_SSKEY, value);
  }

  refreshState() {
    if (!this.activeView.isRoomView) {
      this.exitRoom(Constants.notifCodes.UNKNOWN_ERROR);
      return;
    }
    this.activeView.showNotifUI(Constants.notifCodes.SYNCING_STATE);
    ClientSocket.send(
      new StateRequestMessage(this.roomCode, this.userName)
    ).then((response: any) => {
      if (!this.activeView.isRoomView) return;
      this.activeView.hideNotifUI();
      this.activeView.updateRoomState(response.state);
    });
  }

  getRandomCode() {
    return Math.floor((1 + Math.random()) * 0x1000000000).toString(16);
  }

  exitRoom(reasonCode: number) {
    console.log("Exiting room because of error code " + reasonCode);
    this.lastNotifCode = reasonCode;
    if (this.activeView.isRoomView) this.activeView.disablePrompt();
    sessionStorage.setItem(Constants.USER_NAME_SSKEY, null);
    sessionStorage.setItem(Constants.ROOM_CODE_SSKEY, null);
    ClientSocket.close();
    if (this.history.location.pathname !== Constants.HOME_PATH)
      this.goTo(Constants.HOME_PATH);
  }

  handeRoomUpdate(msg: RoomUpdateMessage) {
    const newRoomState = msg.newRoomState;
    const existingPlayer = newRoomState.players[this.userName];
    if (
      !existingPlayer ||
      ClientSocket.getSocketId() !== existingPlayer.socketId
    )
      this.exitRoom(Constants.notifCodes.JOIN_ANOTHER_DEVICE);
    else if (this.activeView.isRoomView)
      this.activeView.updateRoomState(msg.newRoomState);
  }

  handleThisPlayerDC() {
    if (this.activeView.isRoomView)
      this.activeView.showNotifUI(Constants.notifCodes.CLIENT_DISCONNECTED);
  }

  handleThisPlayerRC() {
    this.refreshState();
    if (this.activeView.isRoomView) this.activeView.hideNotifUI();
  }

  handleError(notifCode: number) {
    if (Constants.fatalErrors.indexOf(notifCode) >= 0) this.exitRoom(notifCode);
  }

  handleMessage(msg: Message) {
    if (msg.type === Constants.msgTypes.ROOM_UPDATE)
      this.handeRoomUpdate(msg as RoomUpdateMessage);
    else if (
      msg.type === Constants.msgTypes.CHAT_MESSAGE &&
      this.activeView.isRoomView
    )
      this.activeView.chatBox.pushMessage(msg);
  }
}

export default new ClientHandler();
