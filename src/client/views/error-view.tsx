import * as React from "react";
import constants from "../../constants";
import "./error-view.css";
import { Room } from "../../models";
import navigationService from "../services/navigation-service";

class ErrorView extends React.Component<{}, {}> {
  handleHomeClick() {
    navigationService.goTo(constants.HOME_PATH);
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
