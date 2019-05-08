import * as React from "react";
import { ViewBase } from "../../view-base";
import Constants from "../../../constants";
import ClientHandler from "../../client-handler";
import "./error-view.css";
import { Room } from "../../../models";

class ErrorView extends ViewBase<{}, {}> {
  handleHomeClick() {
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
    return (
      <div className="view error-view">
        <h1>Something went wrong :)</h1>
        <div>Please try join the room again from the home view</div>
        <button
          className="btn btn-success home-btn"
          onClick={e => this.handleHomeClick()}
        >
          Back to home view
        </button>
      </div>
    );
  }
}

export default ErrorView;
