import {
  SpokAction,
  UpdateRoomActionType,
  SetRoomInfoActionType
} from "../actions";
import { Room } from "../models";

export interface RoomState {
  data: Room;
  userName: string;
  roomCode: string;
}

const initialState: RoomState = {
  data: null,
  roomCode: null,
  userName: null
};

export function roomReducer(
  state: RoomState = initialState,
  action: SpokAction
): RoomState {
  if (action.type === UpdateRoomActionType) {
    return { ...state, data: action.newRoom };
  } else if (action.type === SetRoomInfoActionType) {
    return { ...state, userName: action.userName, roomCode: action.roomCode };
  }
  return state;
}
