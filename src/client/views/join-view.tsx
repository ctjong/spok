import * as React from "react";
import constants from "../../constants";
import Title from "../components/title";
import "./join-view.css";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { returnType, StoreShape } from "../reducers";
import { joinRoom } from "../actions/room";
import { goTo } from "../actions/navigation";

const actionCreators = { joinRoom, goTo };
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

interface JoinViewState {
  notifCode: string;
  isLoading: boolean;
}

class JoinView extends React.Component<
  DispatchProps & StoreProps,
  JoinViewState
> {
  roomCodeRef: React.RefObject<any>;
  userNameRef: React.RefObject<any>;
  isJoinView: boolean;

  constructor(props: DispatchProps & StoreProps) {
    super(props);
    this.roomCodeRef = React.createRef();
    this.userNameRef = React.createRef();
    this.isJoinView = true;
    this.state = { notifCode: null, isLoading: false };
  }

  componentDidUpdate() {
    if (this.props.roomCode && this.props.room) {
      this.props.goTo(`/room/${this.props.roomCode}`);
    }
  }

  async handleSubmitClick() {
    const roomCode = this.roomCodeRef.current.value;
    const userName = this.userNameRef.current.value;

    this.setState({ isLoading: true });
    await this.props.joinRoom(userName, roomCode);
  }

  handleBackClick() {
    this.props.goTo(constants.HOME_PATH);
  }

  render() {
    let body = null;
    if (this.state.isLoading) body = <div>Please wait</div>;
    else {
      body = (
        <div>
          <div className="error">
            {constants.notifStrings[this.state.notifCode]}
          </div>
          <div className="control-group">
            <div>
              <label>Room code:</label>
            </div>
            <div>
              <input
                type="text"
                className="input"
                id="joinPage_roomCode"
                ref={this.roomCodeRef}
              />
            </div>
          </div>
          <div className="control-group">
            <div>
              <label>Your user name:</label>
            </div>
            <div>
              <input
                type="text"
                className="input"
                id="joinPage_userName"
                ref={this.userNameRef}
              />
            </div>
          </div>
          <div className="note">
            If you are trying to reconnect, please enter the same user name that
            you used previously.
          </div>
          <button
            className="btn-box submit-btn"
            onClick={e => this.handleSubmitClick()}
          >
            Submit
          </button>
          <button
            className="btn-box back-btn"
            onClick={e => this.handleBackClick()}
          >
            Back
          </button>
        </div>
      );
    }

    return (
      <div className="view join-view">
        <Title isLarge={true} />
        {body}
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  dispatch => bindActionCreators(actionCreators, dispatch)
)(JoinView);
