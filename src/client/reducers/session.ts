import {
  SpokAction,
  SetSessionRoomCodeActionType,
  SetSessionUserNameActionType
} from "../actions";
import constants from "../../constants";

export interface SessionState {
  roomCode: string;
  userName: string;
}

const initialState: SessionState = {
  roomCode: sessionStorage.getItem(constants.USER_NAME_SSKEY),
  userName: sessionStorage.getItem(constants.ROOM_CODE_SSKEY)
};

export function sessionReducer(
  state: SessionState = initialState,
  action: SpokAction
): SessionState {
  if (action.type === SetSessionUserNameActionType) {
    return { ...state, userName: action.userName };
  } else if (action.type === SetSessionRoomCodeActionType) {
    return { ...state, roomCode: action.roomCode };
  }
  return state;
}
