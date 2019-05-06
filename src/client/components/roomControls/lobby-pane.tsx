import * as React from "react";
import ClientHandler from "../../client-message-handler";
import { StartRoundMessage } from "../../../models";
import "./lobby-pane.css";
import ClientSocket from "../../client-socket";

class LobbyPane extends React.Component {
  handleStartClick() {
    ClientSocket.send(new StartRoundMessage(ClientHandler.roomCode));
  }

  render() {
    const content = ClientHandler.isHostUser() ? (
      <div>
        <button
          className="btn-box start-btn"
          onClick={e => this.handleStartClick()}
        >
          Start
        </button>
      </div>
    ) : (
      <div className="wait-for-host-text">
        Waiting for host to start the round
      </div>
    );

    return (
      <div className="pane lobby-pane">
        <div>
          <h2>Room Code:</h2>
          <div className="roomcode-large">{ClientHandler.roomCode}</div>
        </div>
        {content}
      </div>
    );
  }
}

export default LobbyPane;
