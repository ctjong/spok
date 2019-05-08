import * as React from "react";
import ClientHandler from "../../client-handler";
import { KickPlayerMessage, SetAsHostMessage, Player } from "../../../models";
import "./participant-list.css";

class ParticipantList extends React.Component {
  handleKickButtonClick(player: Player) {
    ClientHandler.send(
      new KickPlayerMessage(ClientHandler.roomCode, player.userName)
    );
  }

  handleSetAsHostButtonClick(player: Player) {
    ClientHandler.send(
      new SetAsHostMessage(ClientHandler.roomCode, player.userName)
    );
  }

  getList() {
    const playerList: Player[] = [];
    Object.keys(ClientHandler.getRoomState().players).forEach(userName => {
      playerList.push(ClientHandler.getRoomState().players[userName]);
    });
    playerList.sort((a: Player, b: Player) => {
      return b.score - a.score;
    });

    const playerDivs: any[] = [];
    playerList.forEach(player => {
      const className = "player " + (player.isOnline ? "" : "offline");
      const hostControls =
        ClientHandler.isHostUser() &&
        ClientHandler.userName !== player.userName ? (
          <span>
            (<a onClick={() => this.handleKickButtonClick(player)}>kick</a>) (
            <a onClick={() => this.handleSetAsHostButtonClick(player)}>
              set as host
            </a>
            )
          </span>
        ) : null;
      const hostLabel =
        ClientHandler.getRoomState().hostUserName === player.userName ? (
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
