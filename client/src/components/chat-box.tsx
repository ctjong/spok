import * as React from "react";
import { ChatMessage } from "spok-shared/models";
import "./chat-box.css";
import clientSocket from "../services/client-socket";
import { StoreShape, returnType } from "../reducers";
import { connect } from "react-redux";

const mapStateToProps = (state: StoreShape) => {
  return {
    room: state.room.data,
    userName: state.room.userName,
    roomCode: state.room.roomCode,
    chatMessages: state.chat.messages
  };
};

const storeProps = returnType(mapStateToProps);
type StoreProps = typeof storeProps.returnType;

class ChatBox extends React.Component<StoreProps, {}> {
  inputRef: React.RefObject<any>;
  scrollViewRef: React.RefObject<any>;

  constructor(props: StoreProps) {
    super(props);
    this.inputRef = React.createRef();
    this.scrollViewRef = React.createRef();
    this.state = { messages: [] };
  }

  componentDidUpdate() {
    const el = this.scrollViewRef.current;
    el.scrollTo(0, el.scrollHeight);
  }

  handleSendClick() {
    const text = this.inputRef.current.value;
    if (!text) return;
    this.inputRef.current.value = "";
    clientSocket.send(
      new ChatMessage(this.props.roomCode, this.props.userName, text)
    );
  }

  handleKeyDown(e: any) {
    if (e.keyCode === 13) this.handleSendClick();
  }

  render() {
    let counter = 0;
    const rows: any[] = [];
    this.props.chatMessages.forEach(msg => {
      if (msg.authorUserName) {
        rows.push(
          <div key={counter++}>
            <span className="chat-author">{msg.authorUserName}</span>
            <span className="chat-message">{msg.text}</span>
          </div>
        );
      } else {
        rows.push(
          <div key={counter++}>
            <span className="chat-message">{msg.text}</span>
          </div>
        );
      }
    });

    return (
      <div className="chat-box">
        <div className="chat-box-chats" ref={this.scrollViewRef}>
          <div className="chat-box-innerchats">{rows}</div>
        </div>
        <div className="input-row">
          <input
            type="text"
            placeholder="type a message"
            className="form-control chat-box-input"
            onKeyDown={e => this.handleKeyDown(e)}
            ref={this.inputRef}
          />
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(ChatBox);
