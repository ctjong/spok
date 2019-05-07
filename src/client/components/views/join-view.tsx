import * as React from "react";
import { ViewBase, ViewBaseProps } from "../../view-base";
import ClientHandler from "../../client-message-handler";
import ClientSocket from "../../client-socket";
import Constants from "../../../constants";
import Title from "../shared/title";
import {
  JoinRequestMessage,
  SpokResponse,
  ErrorResponse,
  Room
} from "../../../models";
import "./join-view.css";

interface JoinViewStates {
  notifCode: number;
  isLoading: boolean;
}

class JoinView extends ViewBase<{}, JoinViewStates> {
  roomCodeRef: React.RefObject<any>;
  userNameRef: React.RefObject<any>;
  isJoinView: boolean;

  constructor(props: ViewBaseProps) {
    super(props);
    this.roomCodeRef = React.createRef();
    this.userNameRef = React.createRef();
    this.isJoinView = true;
    this.state = { room: null, notifCode: null, isLoading: false };
  }

  handleSubmitClick() {
    const roomCode = this.roomCodeRef.current.value;
    const userName = this.userNameRef.current.value;

    this.setState({ isLoading: true });
    ClientHandler.setUserName(userName);
    ClientSocket.send(new JoinRequestMessage(roomCode, userName)).then(
      (response: SpokResponse) => {
        if (!response.isSuccess) {
          const errResponse = response as ErrorResponse;
          this.setState({
            isLoading: false,
            notifCode: errResponse.notifCode
          });
        } else ClientHandler.goTo(`/room/${roomCode}`);
      }
    );
  }

  handleBackClick() {
    ClientHandler.goTo(Constants.HOME_PATH);
  }

  showNotifUI(notifCode: number) {
    throw new Error("Not implemented");
  }

  hideNotifUI() {
    throw new Error("Not implemented");
  }

  updateRoomState(state: Room) {
    throw new Error("Not implemented");
  }

  disablePrompt() {
    throw new Error("Not implemented");
  }

  render() {
    let body = null;
    if (this.state.isLoading) body = <div>Please wait</div>;
    else {
      body = (
        <div>
          <div className="error">
            {Constants.notifStrings[this.state.notifCode]}
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

export default JoinView;
