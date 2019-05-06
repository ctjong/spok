import * as React from "react";
import ClientHandler from "../../client-message-handler";
import Strings from "../../strings";
import ClientSocket from "../../client-socket";
import { Part, SubmitPartMessage } from "../../../models";
import "./write-pane.css";

class WritePane extends React.Component {
  inputRef: React.RefObject<any>;

  constructor(props: {}) {
    super(props);
    this.inputRef = React.createRef();
  }

  handleSubmitClick() {
    if (!this.inputRef.current) return;
    const text = this.inputRef.current.value;
    if (!text) return;
    this.inputRef.current.value = "";
    const paperId = ClientHandler.getRoomState().players[ClientHandler.userName]
      .paperId;

    const part = new Part(paperId, text, ClientHandler.userName);
    ClientSocket.send(new SubmitPartMessage(ClientHandler.roomCode, part));
  }

  render() {
    const label =
      Strings[ClientHandler.getRoomState().lang].labels[
        ClientHandler.getRoomState().activePart
      ];
    const placeholder =
      Strings[ClientHandler.getRoomState().lang].placeholders[
        ClientHandler.getRoomState().activePart
      ];

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

export default WritePane;
