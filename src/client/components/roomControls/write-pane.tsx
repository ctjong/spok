import * as React from "react";
import clientHandler from "../../client-handler";
import Strings from "../../strings";
import { Part, SubmitPartMessage } from "../../../models";
import "./write-pane.css";
import clientSocket from "../../client-socket";

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
    const paperId = clientHandler.getRoomState().players[clientHandler.userName]
      .paperId;

    const part = new Part(paperId, text, clientHandler.userName);
    clientSocket.send(new SubmitPartMessage(clientHandler.roomCode, part));
  }

  render() {
    const label =
      Strings[clientHandler.getRoomState().lang].labels[
        clientHandler.getRoomState().activePart
      ];
    const placeholder =
      Strings[clientHandler.getRoomState().lang].placeholders[
        clientHandler.getRoomState().activePart
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
