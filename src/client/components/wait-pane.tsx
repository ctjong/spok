import * as React from "react";
import Strings from "../strings";
import { Part, SubmitPartMessage } from "../../models";
import "./wait-pane.css";
import clientSocket from "../services/client-socket";
import { connect } from "react-redux";
import { StoreShape, returnType } from "../reducers";
import util from "../../util";

const mapStateToProps = (state: StoreShape) => {
  return {
    room: state.room.data,
    userName: state.room.userName,
    roomCode: state.room.roomCode
  };
};

const storeProps = returnType(mapStateToProps);
type StoreProps = typeof storeProps.returnType;

class WaitPane extends React.Component<StoreProps, {}> {
  handleSkipClick() {
    Object.keys(this.props.room.papers).forEach(paperId => {
      const paper = this.props.room.papers[paperId];
      if (!paper.parts[this.props.room.activePart]) {
        const randomArr =
          Strings[this.props.room.lang].randoms[this.props.room.activePart];
        const randomIdx = Math.floor(
          Math.random() * Math.floor(randomArr.length)
        );
        const part = new Part(paperId, randomArr[randomIdx], null);
        clientSocket.send(new SubmitPartMessage(this.props.roomCode, part));
      }
    });
  }

  render() {
    const playerNames: string[] = [];
    Object.keys(this.props.room.players).forEach(userName => {
      const paperId = this.props.room.players[userName].paperId;
      const paper = this.props.room.papers[paperId];
      if (paper && !paper.parts[this.props.room.activePart])
        playerNames.push(userName);
    });
    const playerNamesJoined = playerNames.join(", ");

    const skipBtn = util.isHostUser(this.props.room, this.props.userName) ? (
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

export default connect(mapStateToProps)(WaitPane);
