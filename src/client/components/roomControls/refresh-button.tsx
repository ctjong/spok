import * as React from "react";
import ClientHandler from "../../client-handler";
import RefreshImg from "../../images/refresh.png";
import "./refresh-button.css";

class RefreshButton extends React.Component {
  handleRefreshClick() {
    ClientHandler.refreshState();
  }

  render() {
    return (
      <div className="refresh-btn" onClick={() => this.handleRefreshClick()}>
        <img src={RefreshImg} alt="refresh" />
      </div>
    );
  }
}

export default RefreshButton;
