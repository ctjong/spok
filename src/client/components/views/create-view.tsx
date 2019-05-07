import * as React from "react";
import { ViewBase, ViewBaseProps } from "../../view-base";
import ClientHandler from "../../client-message-handler";
import ClientSocket from "../../client-socket";
import Constants from "../../../constants";
import Strings from "../../strings";
import Title from "../shared/title";
import { CreateRoomMessage, Room } from "../../../models";
import "./create-view.css";

interface CreateViewStates {
  isLoading: boolean;
}

class CreateView extends ViewBase<{}, CreateViewStates> {
  userNameRef: React.RefObject<any>;
  langSelectRef: React.RefObject<any>;

  constructor(props: ViewBaseProps) {
    super(props);
    this.userNameRef = React.createRef();
    this.langSelectRef = React.createRef();
    this.state = { room: null, isLoading: false };
  }

  handleSubmitClick() {
    const roomCode = ClientHandler.getRandomCode().substring(0, 5);
    const userName = this.userNameRef.current.value;
    if (!userName) return;

    this.setState({ isLoading: true });
    ClientHandler.setUserName(userName);
    let lang = Constants.DEFAULT_LANG;
    if (this.langSelectRef.current) {
      const dropdown = this.langSelectRef.current;
      const selectedIndex = dropdown.selectedIndex;
      lang = dropdown.options[selectedIndex].value;
    }
    ClientSocket.send(new CreateRoomMessage(roomCode, userName, lang)).then(
      () => {
        ClientHandler.goTo(`/room/${roomCode}`);
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
    if (this.state.isLoading) return <div>Please wait</div>;

    const optionDoms: any[] = [];
    Object.keys(Strings).forEach(lang => {
      optionDoms.push(
        <option key={lang} value={lang}>
          {Strings[lang].langName}
        </option>
      );
    });

    return (
      <div className="view create-view">
        <Title isLarge={true} />
        <div>
          <div className="control-group">
            <div>
              <label>Your user name:</label>
            </div>
            <div>
              <input
                type="text"
                className="input"
                id="createPage_userName"
                ref={this.userNameRef}
              />
            </div>
          </div>
          <div className="control-group">
            <div>
              <label>Language: </label>
            </div>
            <div>
              <select className="lang-options" ref={this.langSelectRef}>
                {optionDoms}
              </select>
            </div>
          </div>
        </div>
        <button
          className="btn-box submit-btn"
          onClick={e => this.handleSubmitClick()}
        >
          Submit
        </button>
        <button
          className="btn-box btn-danger back-btn"
          onClick={e => this.handleBackClick()}
        >
          Back
        </button>
      </div>
    );
  }
}

export default CreateView;
