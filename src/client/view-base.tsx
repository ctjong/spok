import * as React from "react";
import clientHandler from "./services/client-handler";
import { History } from "history";
import { Room } from "../models";
import constants from "../constants";
import navigationService from "./services/navigation-service";

export interface ViewBaseProps {
  history: History;
  match: any;
}

interface ViewBaseState {
  room: Room;
}

export abstract class ViewBase<ChildProps, ChildStates> extends React.Component<
  ViewBaseProps & ChildProps,
  ViewBaseState & ChildStates
> {
  isRoomView: boolean;
  chatBox: any; //TODO

  constructor(props: ViewBaseProps & ChildProps) {
    super(props);
    clientHandler.activeView = this;
    navigationService.setHistory(this.props.history);
    navigationService.addHistoryChangeHandler("roomStateError", location => {
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
