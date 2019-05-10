import { SpokAction, SetRoomActionType } from "../actions";
import { Room } from "../../models";

const initialState: Room = {
  roomCode: null,
  lang: null,
  activePart: 0,
  phase: 0,
  players: {},
  papers: {},
  hostUserName: null
};

export function roomReducer(
  state: Room = initialState,
  action: SpokAction
): Room {
  if (action.type === SetRoomActionType) {
    return action.newRoom;
  }
  return state;
}
