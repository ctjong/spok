import * as React from "react";
import clientHandler from "../../client-handler";
import { KickPlayerMessage, SetAsHostMessage, Player } from "../../../models";
import "./participant-list.css";
import clientSocket from "../../client-socket";

class ParticipantList extends React.Component {
  handleKickButtonClick(player: Player) {
    clientSocket.send(
      new KickPlayerMessage(clientHandler.roomCode, player.userName)
    );
  }

  handleSetAsHostButtonClick(player: Player) {
    clientSocket.send(
      new SetAsHostMessage(clientHandler.roomCode, player.userName)
    );
  }

  getList() {
    const playerList: Player[] = [];
    Object.keys(clientHandler.getRoomState().players).forEach(userName => {
      playerList.push(clientHandler.getRoomState().players[userName]);
    });
    playerList.sort((a: Player, b: Player) => {
      return b.score - a.score;
    });

    const playerDivs: any[] = [];
    playerList.forEach(player => {
      const className = "player " + (player.isOnline ? "" : "offline");
      const hostControls =
        clientHandler.isHostUser() &&
        clientHandler.userName !== player.userName ? (
          <span>
            (<a onClick={() => this.handleKickButtonClick(player)}>kick</a>) (
            <a onClick={() => this.handleSetAsHostButtonClick(player)}>
              set as host
            </a>
            )
          </span>
        ) : null;
      const hostLabel =
        clientHandler.getRoomState().hostUserName === player.userName ? (
          <span>(host)</span>
        ) : null;
      playerDivs.push(
        <div key={player.userName} className={className}>
          {player.userName} = {player.score} {hostLabel}
          {hostControls}
        </div>
      );
    });
    return playerDivs;
  }

  render() {
    return (
      <div className="participant-list">
        <div>
          <strong>Scores: </strong>
        </div>
        <div className="scores">{this.getList()}</div>
      </div>
    );
  }
}

export default ParticipantList;
