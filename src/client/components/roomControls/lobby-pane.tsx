import * as React from "react";
import clientHandler from "../../client-handler";
import { StartRoundMessage } from "../../../models";
import "./lobby-pane.css";
import clientSocket from "../../client-socket";

class LobbyPane extends React.Component {
  handleStartClick() {
    clientSocket.send(new StartRoundMessage(clientHandler.roomCode));
  }

  render() {
    const content = clientHandler.isHostUser() ? (
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
          <div className="roomcode-large">{clientHandler.roomCode}</div>
        </div>
        {content}
      </div>
    );
  }
}

export default LobbyPane;
