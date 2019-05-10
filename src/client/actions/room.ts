import { SpokActionCreator, SetRoomActionType } from ".";
import { Room } from "../../models";

export async function* setRoom(room: Room): SpokActionCreator {
  yield { type: SetRoomActionType, newRoom: room };
}
