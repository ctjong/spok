import * as React from "react";
import clientHandler from "./client-handler";
import util from "./util";
import { History } from "history";
import { Room } from "../models";
import ChatBox from "./components/roomControls/chat-box";
import constants from "../constants";

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
    clientHandler.activeView = this;
    util.initHistory(this.props.history);
    util.addHistoryChangeHandler(location => {
      if (
        location.pathname.indexOf("/room") !== 0 &&
        clientHandler.getRoomState()
      ) {
        clientHandler.exitRoom(constants.notifCodes.UNKNOWN_ERROR);
      }
    });
  }

  abstract showNotifUI(notifCode: string): void;
  abstract hideNotifUI(): void;
  abstract updateRoomState(state: Room): void;
  abstract disablePrompt(): void;
}
