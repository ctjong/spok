import * as React from "react";
import { KickPlayerMessage, SetAsHostMessage, Player } from "../../models";
import "./participant-list.css";
import clientSocket from "../services/client-socket";
import { setError } from "../actions/error";
import { returnType, StoreShape } from "../reducers";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import util from "../../util";

const actionCreators = { setError };
type DispatchProps = typeof actionCreators;

const mapStateToProps = (state: StoreShape) => {
  return {
    room: state.room.data,
    userName: state.room.userName,
    roomCode: state.room.roomCode
  };
};

const storeProps = returnType(mapStateToProps);
type StoreProps = typeof storeProps.returnType;

class ParticipantList extends React.Component<DispatchProps & StoreProps, {}> {
  handleKickButtonClick(player: Player) {
    clientSocket.send(
      new KickPlayerMessage(this.props.roomCode, player.userName)
    );
  }

  handleSetAsHostButtonClick(player: Player) {
    clientSocket.send(
      new SetAsHostMessage(this.props.roomCode, player.userName)
    );
  }

  getList() {
    const playerList: Player[] = [];
    Object.keys(this.props.room.players).forEach(userName => {
      playerList.push(this.props.room.players[userName]);
    });
    playerList.sort((a: Player, b: Player) => {
      return b.score - a.score;
    });

    const playerDivs: any[] = [];
    playerList.forEach(player => {
      const className = "player " + (player.isOnline ? "" : "offline");
      const hostControls =
        util.isHostUser(this.props.room, this.props.userName) &&
        this.props.userName !== player.userName ? (
          <span>
            (<a onClick={() => this.handleKickButtonClick(player)}>kick</a>) (
            <a onClick={() => this.handleSetAsHostButtonClick(player)}>
              set as host
            </a>
            )
          </span>
        ) : null;
      const hostLabel =
        this.props.room.hostUserName === player.userName ? (
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

export default connect(
  mapStateToProps,
  dispatch => bindActionCreators(actionCreators, dispatch)
)(ParticipantList);
