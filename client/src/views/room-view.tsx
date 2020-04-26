import * as React from "react";
import { Prompt } from "react-router";
import constants from "../client-constants";
import ParticipantList from "../components/participant-list";
import ChatBox from "../components/chat-box";
import LobbyPane from "../components/lobby-pane";
import RevealPane from "../components/reveal-pane";
import WaitPane from "../components/wait-pane";
import WritePane from "../components/write-pane";
import Title from "../components/title";
import RefreshButton from "../components/refresh-button";
import { GoToLobbyMessage } from "../client-models";
import "./room-view.css";
import clientSocket from "../services/client-socket";
import { returnType, StoreShape } from "../reducers";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import util from "../client-util";
import { joinRoom, exitRoom } from "../actions/room";

const actionCreators = {
  joinRoom,
  exitRoom
};
type DispatchProps = typeof actionCreators;

const mapStateToProps = (state: StoreShape) => {
  return {
    room: state.room.data,
    userName: state.room.userName,
    roomCode: state.room.roomCode,
    activeNotifCode: state.notification.activeCode
  };
};

const storeProps = returnType(mapStateToProps);
type StoreProps = typeof storeProps.returnType;

interface RoomViewProps {
  match: any;
}

class RoomView extends React.Component<
  DispatchProps & StoreProps & RoomViewProps,
  {}
  > {
  constructor(props: DispatchProps & StoreProps & RoomViewProps) {
    super(props);
    this.state = { isPromptDisabled: false, notifCode: null };
  }

  componentDidMount() {
    // If the user deep links directly into a room URL, the room will not already
    // be joined when the RoomView is loaded. So here we need to check if a saved
    // username exists and join the room if it does. Otherwise, exit the room.
    if (!this.props.roomCode) {
      const urlRoomCode = this.props.match.params.roomCode;
      const savedUserName = sessionStorage.getItem(constants.USER_NAME_SSKEY);
      if (savedUserName) {
        this.props.joinRoom(savedUserName, urlRoomCode);
      } else {
        this.props.exitRoom(constants.notifCodes.NOT_IN_ROOM);
      }
    }
  }

  componentWillUnmount() {
    // If the user navigates away from the room and hits OK on the prompt,
    // exit the room gracefully
    if (this.props.room) {
      this.props.exitRoom(null);
    }
  }

  getActivePane() {
    switch (this.props.room.phase) {
      case constants.phases.LOBBY:
        return <LobbyPane />;
      case constants.phases.WRITE:
        const player = this.props.room.players[this.props.userName];
        if (!player) return;
        const currentPaperId = player.paperId;
        const currentPaper = this.props.room.papers[currentPaperId];
        if (currentPaper && !currentPaper.parts[this.props.room.activePart])
          return <WritePane />;
        else return <WaitPane />;
      case constants.phases.REVEAL:
        return <RevealPane />;
      default:
        return null;
    }
  }

  handleLobbyButtonClick() {
    clientSocket.send(new GoToLobbyMessage(this.props.roomCode));
  }

  render() {
    const prompt = this.props.room ? (
      // React-router's Prompt element will be shown automatically
      // before the page unloads.
      <Prompt message="Are you sure you want to leave?" />
    ) : null;

    let body = null;
    if (this.props.activeNotifCode)
      body = <div>{constants.notifStrings[this.props.activeNotifCode]}</div>;
    else if (!this.props.room)
      body = <div>{constants.notifStrings[constants.notifCodes.LOADING]}</div>;
    else {
      const lobbyBtn =
        util.isHostUser(this.props.room, this.props.userName) &&
          this.props.room.phase > constants.phases.LOBBY ? (
            <button
              className="btn-box lobby-btn"
              onClick={() => this.handleLobbyButtonClick()}
            >
              Back to lobby
            </button>
          ) : null;
      body = (
        <div>
          <RefreshButton />
          {this.getActivePane()}
          {lobbyBtn}
          <ParticipantList />
          <ChatBox />
        </div>
      );
    }

    return (
      <div className="view room-view">
        {prompt}
        <Title isLarge={false} />
        {body}
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  dispatch => bindActionCreators(actionCreators, dispatch)
)(RoomView);
