import * as React from "react";
import { Prompt } from "react-router";
import { ViewBase, ViewBaseProps } from "../view-base";
import clientHandler from "../services/client-handler";
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

const actionCreators = { setError, setSessionRoomCode };
type DispatchProps = typeof actionCreators;

const mapStateToProps = (state: StoreShape) => {
  return {
    room: state.room,
    session: state.session
  };
};

const storeProps = returnType(mapStateToProps);
type StoreProps = typeof storeProps.returnType;

interface RoomViewState {
  isPromptDisabled: boolean;
  notifCode: string;
}

class RoomView extends ViewBase<DispatchProps & StoreProps, RoomViewState> {
  isCompMounted: boolean;

  constructor(props: DispatchProps & StoreProps & ViewBaseProps) {
    super(props);
    this.state = { room: null, isPromptDisabled: false, notifCode: null };
    this.isRoomView = true;
    this.chatBox = null;
    this.isCompMounted = false;
    this.props.setSessionRoomCode(this.props.match.params.roomCode);
    clientHandler.refreshState();
  }

  componentDidMount() {
    this.isCompMounted = true;
    this.setState({ isPromptDisabled: false });
  }

  getActivePane() {
    switch (this.state.room.phase) {
      case constants.phases.LOBBY:
        return <LobbyPane />;
      case constants.phases.WRITE:
        const player = this.state.room.players[this.props.session.userName];
        if (!player) return;
        const currentPaperId = player.paperId;
        const currentPaper = this.props.room.papers[currentPaperId];
        if (currentPaper && !currentPaper.parts[this.state.room.activePart])
          return <WritePane />;
        else return <WaitPane />;
      case constants.phases.REVEAL:
        return <RevealPane />;
      default:
        return null;
    }
  }

  showNotifUI(notifCode: string) {
    if (this.isCompMounted) this.setState({ notifCode });
    else this.state = { ...this.state, notifCode };
  }

  hideNotifUI() {
    if (this.isCompMounted) this.setState({ notifCode: null });
    else this.state = { ...this.state, notifCode: null };
  }

  disablePrompt() {
    if (this.isCompMounted) this.setState({ isPromptDisabled: true });
    else this.state = { ...this.state, isPromptDisabled: true };
  }

  updateRoomState(newRoomState: Room) {
    if (this.isCompMounted) this.setState({ room: newRoomState });
    else this.state = { ...this.state, room: newRoomState };
  }

  handleLobbyButtonClick() {
    clientSocket.send(new GoToLobbyMessage(this.props.session.roomCode));
  }

  render() {
    const prompt = this.state.isPromptDisabled ? null : (
      // React-router's Prompt element will be shown automatically
      // before the page unloads.
      <Prompt message="Are you sure you want to leave?" />
    );
    let body = null;
    if (this.state.notifCode)
      body = <div>{constants.notifStrings[this.state.notifCode]}</div>;
    else if (!this.state.room)
      body = <div>{constants.notifStrings[constants.notifCodes.LOADING]}</div>;
    else {
      const lobbyBtn =
        clientHandler.isHostUser() &&
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
          <ChatBox ref={el => (this.chatBox = el)} />
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
