import * as React from "react";
import { Prompt } from "react-router";
import { ViewBase, ViewBaseProps } from "../../view-base";
import clientHandler from "../../client-handler";
import constants from "../../../constants";
import ParticipantList from "../roomControls/participant-list";
import ChatBox from "../roomControls/chat-box";
import LobbyPane from "../roomControls/lobby-pane";
import RevealPane from "../roomControls/reveal-pane";
import WaitPane from "../roomControls/wait-pane";
import WritePane from "../roomControls/write-pane";
import Title from "../shared/title";
import RefreshButton from "../roomControls/refresh-button";
import { GoToLobbyMessage, Room } from "../../../models";
import "./room-view.css";
import clientSocket from "../../client-socket";

interface RoomViewStates {
  isPromptDisabled: boolean;
  notifCode: string;
}

class RoomView extends ViewBase<{}, RoomViewStates> {
  isCompMounted: boolean;

  constructor(props: ViewBaseProps) {
    super(props);
    this.state = { room: null, isPromptDisabled: false, notifCode: null };
    this.isRoomView = true;
    this.chatBox = null;
    this.isCompMounted = false;
    clientHandler.setRoomCode(this.props.match.params.roomCode);
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
        const player = this.state.room.players[clientHandler.userName];
        if (!player) return;
        const currentPaperId = player.paperId;
        const currentPaper = clientHandler.getRoomState().papers[
          currentPaperId
        ];
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
    clientSocket.send(new GoToLobbyMessage(clientHandler.roomCode));
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
        clientHandler.getRoomState().phase > constants.phases.LOBBY ? (
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

export default RoomView;
