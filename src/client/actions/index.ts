import { Room } from "../../models";

export enum SpokActionType {
  SetErrorActionType,
  SetRoomActionType
}

type SetErrorActionTypeType = "SET_ERROR_ACTION";
export const SetErrorActionType = "SET_ERROR_ACTION";
export type SetErrorAction = {
  type: SetErrorActionTypeType;
  msg: string;
};

type SetRoomActionTypeType = "SET_ROOM_ACTION";
export const SetRoomActionType = "SET_ROOM_ACTION";
export type SetRoomAction = {
  type: SetRoomActionTypeType;
  newRoom: Room;
};

export type SpokAction = SetErrorAction | SetRoomAction;

export type SpokActionCreator = AsyncIterableIterator<SpokAction>;
