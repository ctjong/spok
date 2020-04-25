import { RoomUpdateMessage, SpokMessage, ChatMessage } from "../models";
import constants from "../constants";
import clientSocket from "./client-socket";
import { StoreShape, returnType } from "../reducers";
import * as React from "react";
import { setNotification, hideNotification } from "../actions/notification";
import { updateRoom, syncRoom, exitRoom } from "../actions/room";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { pushChat } from "../actions/chat";
import util from "../util";

const actionCreators = {
  setNotification,
  hideNotification,
  updateRoom,
  syncRoom,
  exitRoom,
  pushChat
};
type DispatchProps = typeof actionCreators;

const mapStateToProps = (state: StoreShape) => {
  return {
    room: state.room.data,
    userName: state.room.userName,
    roomCode: state.room.roomCode
  };
};

const storeProps = returnType(mapStateToProps);
type StoreProps = typeof storeProps.returnType;

class ClientHandler extends React.Component<DispatchProps & StoreProps, {}> {
  constructor(props: DispatchProps & StoreProps) {
    super(props);
    clientSocket.addDisconnectHandler(() => this.handleDisconnected());
    clientSocket.addErrorHandler((code: string) => this.handleError(code));
    clientSocket.addMessageHandler((msg: SpokMessage) =>
      this.handleMessage(msg)
    );
  }

  handeRoomUpdate(msg: RoomUpdateMessage) {
    const newRoomState = msg.newRoomState;
    const existingPlayer = newRoomState.players[this.props.userName];
    if (!existingPlayer) {
      console.log("[ClientHandler.handeRoomUpdate] player kicked");
      this.props.exitRoom(constants.notifCodes.PLAYER_KICKED);
    } else if (clientSocket.getSocketId() !== existingPlayer.socketId) {
      console.log(
        "[ClientHandler.handeRoomUpdate] joined on another device",
        clientSocket.getSocketId(),
        existingPlayer.socketId
      );
      this.props.exitRoom(constants.notifCodes.JOINED_OTHER_DEVICE);
    } else if (util.isInRoomView()) {
      this.props.updateRoom(msg.newRoomState);
    }
  }

  async handleDisconnected() {
    console.log("[ClientHandler.handleDisconnected]");
    if (!util.isInRoomView()) return;

    this.props.setNotification(constants.notifCodes.RECONNECTING);
    if (await clientSocket.reconnect()) {
      this.props.syncRoom(this.props.userName, this.props.roomCode);
    } else {
      this.props.exitRoom(constants.notifCodes.CLIENT_DISCONNECTED);
    }
  }

  handleError(notifCode: string) {
    if (
      !clientSocket.isReconnecting &&
      constants.fatalErrors.indexOf(notifCode) >= 0
    ) {
      console.log("[ClientHandler.handleError] Fatal error received");
      this.props.exitRoom(notifCode);
    }
  }

  handleMessage(msg: SpokMessage) {
    if (msg.type === constants.msgTypes.ROOM_UPDATE) {
      this.handeRoomUpdate(msg as RoomUpdateMessage);
    } else if (
      msg.type === constants.msgTypes.CHAT_MESSAGE &&
      util.isInRoomView()
    ) {
      this.props.pushChat(msg as ChatMessage);
    }
  }

  render(): any {
    return null;
  }
}

export default connect(
  mapStateToProps,
  dispatch => bindActionCreators(actionCreators, dispatch)
)(ClientHandler);
