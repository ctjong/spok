import { RoomUpdateMessage, SpokMessage } from "../../models";
import constants from "../../constants";
import clientSocket from "./client-socket";
import navigationService from "./navigation-service";
import { setError } from "../actions/error";
import { StoreShape, returnType } from "../reducers";
import * as React from "react";
import { setNotification, hideNotification } from "../actions/notification";
import {
  updateRoom,
  setRoomPromptStatus,
  refreshState,
  exitRoom
} from "../actions/room";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

const actionCreators = {
  setError,
  setNotification,
  hideNotification,
  updateRoom,
  setRoomPromptStatus,
  refreshState,
  exitRoom
};
type DispatchProps = typeof actionCreators;

const mapStateToProps = (state: StoreShape) => {
  return {
    room: state.room.data,
    userName: state.session.userName,
    roomCode: state.session.roomCode
  };
};

const storeProps = returnType(mapStateToProps);
type StoreProps = typeof storeProps.returnType;

class ClientHandler extends React.Component<DispatchProps & StoreProps, {}> {
  constructor(props: DispatchProps & StoreProps) {
    super(props);
    clientSocket.addDisconnectedHandler(() => this.handleDisconnected());
    clientSocket.addReconnectingHandler(() => this.handleReconnecting());
    clientSocket.addReconnectedHandler(() => this.handleReconnected());
    clientSocket.addErrorHandler((code: string) => this.handleError(code));
    clientSocket.addMessageHandler((msg: SpokMessage) =>
      this.handleMessage(msg)
    );
  }

  handeRoomUpdate(msg: RoomUpdateMessage) {
    const newRoomState = msg.newRoomState;
    const existingPlayer = newRoomState.players[this.props.userName];
    if (
      !existingPlayer ||
      clientSocket.getSocketId() !== existingPlayer.socketId
    ) {
      this.props.exitRoom(constants.notifCodes.PLAYER_KICKED);
    } else if (navigationService.isInRoomView()) {
      this.props.updateRoom(msg.newRoomState);
    }
  }

  handleDisconnected() {
    console.log("[ClientHandler.handleDisconnected]");
    if (!navigationService.isInRoomView()) return;
    this.props.exitRoom(constants.notifCodes.CLIENT_DISCONNECTED);
  }

  handleReconnecting() {
    console.log("[ClientHandler.handleReconnecting]");
    if (!navigationService.isInRoomView()) return;
    this.props.setNotification(constants.notifCodes.RECONNECTING);
  }

  handleReconnected() {
    console.log("[ClientHandler.handleReconnected]");
    if (!navigationService.isInRoomView()) return;
    this.props.refreshState(this.props.userName, this.props.roomCode);
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
      navigationService.isInRoomView()
    ) {
      //TODO
      // this.activeView.chatBox.pushMessage(msg as ChatMessage);
    }
  }
}

export default connect(
  mapStateToProps,
  dispatch => bindActionCreators(actionCreators, dispatch)
)(ClientHandler);
