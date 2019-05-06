import * as React from "react";
import ClientHandler from "./client-message-handler";
import { History } from "history";
import { Room } from "../models";
import ChatBox from "./components/roomControls/chat-box";

interface ViewBaseProps {
  history: History;
}

interface ViewBaseStates {
  room: Room;
}

abstract class ViewBase extends React.Component<ViewBaseProps, ViewBaseStates> {
  isRoomView: boolean;
  chatBox: ChatBox;

  constructor(props: any) {
    super(props);
    ClientHandler.activeView = this;
    ClientHandler.initHistory(this.props.history);
  }

  abstract showNotifUI(notifCode: number): void;
  abstract hideNotifUI(): void;
  abstract updateRoomState(state: Room): void;
  abstract disablePrompt(): void;
}

export default ViewBase;
