import * as React from "react";
import { StartRoundMessage } from "../../models";
import "./lobby-pane.css";
import clientSocket from "../services/client-socket";
import { setError } from "../actions/error";
import { StoreShape, returnType } from "../reducers";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import util from "../../util";

const actionCreators = { setError };
type DispatchProps = typeof actionCreators;

const mapStateToProps = (state: StoreShape) => {
  return {
    room: state.room.data,
    userName: state.session.userName,
    roomCode: state.session.roomCode
  };
};

const storeProps = returnType(mapStateToProps);
type StoreProps = typeof storeProps.returnType;

class LobbyPane extends React.Component<DispatchProps & StoreProps, {}> {
  handleStartClick() {
    clientSocket.send(new StartRoundMessage(this.props.roomCode));
  }

  render() {
    const content = util.isHostUser(this.props.room, this.props.userName) ? (
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
          <div className="roomcode-large">{this.props.roomCode}</div>
        </div>
        {content}
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  dispatch => bindActionCreators(actionCreators, dispatch)
)(LobbyPane);
