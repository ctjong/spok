import {
  SpokAction,
  UpdateRoomActionType,
  SetRoomPromptStatusActionType
} from "../actions";
import { Room } from "../../models";

export interface RoomState {
  data: Room;
  isPromptEnabled: boolean;
}

const initialState: RoomState = {
  data: null,
  isPromptEnabled: false
};

export function roomReducer(
  state: RoomState = initialState,
  action: SpokAction
): RoomState {
  if (action.type === UpdateRoomActionType) {
    return { ...state, data: action.newRoom };
  } else if (action.type === SetRoomPromptStatusActionType) {
    return { ...state, isPromptEnabled: action.isEnabled };
  }
  return state;
}
