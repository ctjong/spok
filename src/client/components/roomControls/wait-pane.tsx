import * as React from "react";
import clientHandler from "../../client-handler";
import Strings from "../../strings";
import { Part, SubmitPartMessage } from "../../../models";
import "./wait-pane.css";
import clientSocket from "../../client-socket";

class WaitPane extends React.Component {
  handleSkipClick() {
    Object.keys(clientHandler.getRoomState().papers).forEach(paperId => {
      const paper = clientHandler.getRoomState().papers[paperId];
      if (!paper.parts[clientHandler.getRoomState().activePart]) {
        const randomArr =
          Strings[clientHandler.getRoomState().lang].randoms[
            clientHandler.getRoomState().activePart
          ];
        const randomIdx = Math.floor(
          Math.random() * Math.floor(randomArr.length)
        );
        const part = new Part(paperId, randomArr[randomIdx], null);
        clientSocket.send(new SubmitPartMessage(clientHandler.roomCode, part));
      }
    });
  }

  render() {
    const playerNames: string[] = [];
    Object.keys(clientHandler.getRoomState().players).forEach(userName => {
      const paperId = clientHandler.getRoomState().players[userName].paperId;
      const paper = clientHandler.getRoomState().papers[paperId];
      if (paper && !paper.parts[clientHandler.getRoomState().activePart])
        playerNames.push(userName);
    });
    const playerNamesJoined = playerNames.join(", ");

    const skipBtn = clientHandler.isHostUser() ? (
      <div>
        <button
          className="btn-box skip-btn"
          onClick={e => this.handleSkipClick()}
        >
          Ignore remaining players
        </button>
        <div className="note">
          (This will fill the papers that those people are holding with random
          texts)
        </div>
      </div>
    ) : null;

    return (
      <div className="pane wait-pane">
        <div>
          <div>
            <div>Now let’s wait for these losers:</div>
            <div>{playerNamesJoined}</div>
          </div>
          <div className="waitList" />
        </div>
        {skipBtn}
      </div>
    );
  }
}

export default WaitPane;
