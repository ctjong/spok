import * as React from "react";
import ClientHandler from "./client-message-handler";

class ViewBase extends React.Component {
  constructor(props) {
    super(props);
    ClientHandler.activeView = this;
    ClientHandler.initHistory(this.props.history);
  }
}

export default ViewBase;
