import * as React from "react";
import ClientHandler from "./client-handler";
import { History } from "history";
import { Room } from "../models";
import ChatBox from "./components/roomControls/chat-box";

export interface ViewBaseProps {
  history: History;
  match: any;
}

interface ViewBaseStates {
  room: Room;
}

export abstract class ViewBase<ChildProps, ChildStates> extends React.Component<
  ViewBaseProps & ChildProps,
  ViewBaseStates & ChildStates
> {
  isRoomView: boolean;
  chatBox: ChatBox;

  constructor(props: ViewBaseProps & ChildProps) {
    super(props);
    ClientHandler.activeView = this;
    ClientHandler.initHistory(this.props.history);
  }

  abstract showNotifUI(notifCode: number): void;
  abstract hideNotifUI(): void;
  abstract updateRoomState(state: Room): void;
  abstract disablePrompt(): void;
}
