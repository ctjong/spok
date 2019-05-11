import * as React from "react";
import { Prompt } from "react-router";
import constants from "../../constants";
import ParticipantList from "../components/participant-list";
import ChatBox from "../components/chat-box";
import LobbyPane from "../components/lobby-pane";
import RevealPane from "../components/reveal-pane";
import WaitPane from "../components/wait-pane";
import WritePane from "../components/write-pane";
import Title from "../components/title";
import RefreshButton from "../components/refresh-button";
import { GoToLobbyMessage, Room } from "../../models";
import "./room-view.css";
import clientSocket from "../services/client-socket";
import { returnType, StoreShape } from "../reducers";
import { setError } from "../actions/error";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { setSessionRoomCode } from "../actions/session";
import util from "../../util";
import { setRoomPromptStatus, refreshState } from "../actions/room";

const actionCreators = {
  setError,
  setSessionRoomCode,
  setRoomPromptStatus,
  refreshState
};
type DispatchProps = typeof actionCreators;

const mapStateToProps = (state: StoreShape) => {
  return {
    room: state.room.data,
    isPromptEnabled: state.room.isPromptEnabled,
    userName: state.session.userName,
    roomCode: state.session.roomCode,
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
    this.props.setSessionRoomCode(this.props.match.params.roomCode);
    this.props.refreshState(
      this.props.userName,
      this.props.match.params.roomCode
    );
    if (!this.props.isPromptEnabled) {
      this.props.setRoomPromptStatus(true);
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
    const prompt = this.props.isPromptEnabled ? (
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
