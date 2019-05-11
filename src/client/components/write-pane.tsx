import * as React from "react";
import Strings from "../strings";
import { Part, SubmitPartMessage } from "../../models";
import "./write-pane.css";
import clientSocket from "../services/client-socket";
import { returnType, StoreShape } from "../reducers";
import { setError } from "../actions/error";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

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

class WritePane extends React.Component<DispatchProps & StoreProps, {}> {
  inputRef: React.RefObject<any>;

  constructor(props: DispatchProps & StoreProps) {
    super(props);
    this.inputRef = React.createRef();
  }

  handleSubmitClick() {
    if (!this.inputRef.current) return;
    const text = this.inputRef.current.value;
    if (!text) return;
    this.inputRef.current.value = "";
    const paperId = this.props.room.players[this.props.userName].paperId;

    const part = new Part(paperId, text, this.props.userName);
    clientSocket.send(new SubmitPartMessage(this.props.roomCode, part));
  }

  render() {
    const label =
      Strings[this.props.room.lang].labels[this.props.room.activePart];
    const placeholder =
      Strings[this.props.room.lang].placeholders[this.props.room.activePart];

    return (
      <div className="pane write-pane">
        <div>
          <div className="control-group">
            <div>
              <label>{label}</label>
            </div>
            <div>
              <input
                type="text"
                className="input"
                placeholder={placeholder}
                ref={this.inputRef}
              />
            </div>
          </div>
          <button
            className="btn-box submit-btn"
            onClick={e => this.handleSubmitClick()}
          >
            Submit
          </button>
        </div>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  dispatch => bindActionCreators(actionCreators, dispatch)
)(WritePane);
