import * as React from "react";
import constants from "../../constants";
import Title from "../components/title";
import { JoinRequestMessage, SpokResponse, ErrorResponse } from "../../models";
import "./join-view.css";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { setError } from "../actions/error";
import { setSessionUserName } from "../actions/session";
import { returnType, StoreShape } from "../reducers";
import navigationService from "../services/navigation-service";
import clientSocket from "../services/client-socket";
import { exitRoom } from "../actions/room";

const actionCreators = { setError, setSessionUserName, exitRoom };
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

  componentDidMount() {
    if (this.props.room) {
      this.props.exitRoom(constants.notifCodes.UNKNOWN_ERROR);
    }
  }

  handleSubmitClick() {
    const roomCode = this.roomCodeRef.current.value;
    const userName = this.userNameRef.current.value;

    this.setState({ isLoading: true });
    this.props.setSessionUserName(userName);
    clientSocket
      .send(new JoinRequestMessage(roomCode, userName))
      .then((response: SpokResponse) => {
        if (!response.isSuccess) {
          const errResponse = response as ErrorResponse;
          this.setState({
            isLoading: false,
            notifCode: errResponse.notifCode
          });
        } else navigationService.goTo(`/room/${roomCode}`);
      });
  }

  handleBackClick() {
    navigationService.goTo(constants.HOME_PATH);
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
