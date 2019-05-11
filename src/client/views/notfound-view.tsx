import * as React from "react";
import constants from "../../constants";
import "./notfound-view.css";
import navigationService from "../services/navigation-service";

class NotFoundView extends React.Component<{}, {}> {
  handleHomeClick() {
    navigationService.goTo(constants.HOME_PATH);
  }

  render() {
    return (
      <div className="view notfound-view">
        <h1>URL not found</h1>
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

export default NotFoundView;
