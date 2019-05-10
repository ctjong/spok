import { Room } from "../../models";

export enum SpokActionType {
  SetErrorActionType,
  SetRoomActionType,
  SetNotificationctionType,
  SetSessionUserNameActionType,
  SetSessionRoomCodeActionType
}

type SetErrorActionTypeType = "SET_ERROR";
export const SetErrorActionType = "SET_ERROR";
export type SetErrorAction = {
  type: SetErrorActionTypeType;
  msg: string;
};

type SetRoomActionTypeType = "SET_ROOM";
export const SetRoomActionType = "SET_ROOM";
export type SetRoomAction = {
  type: SetRoomActionTypeType;
  newRoom: Room;
};

type SetNotificationActionTypeType = "SET_NOTIFICATION";
export const SetNotificationctionType = "SET_NOTIFICATION";
export type SetNotificationction = {
  type: SetNotificationActionTypeType;
  code: string;
};

type SetSessionUserNameActionTypeType = "SET_SESSION_USER_NAME";
export const SetSessionUserNameActionType = "SET_SESSION_USER_NAME";
export type SetSessionUserNameAction = {
  type: SetSessionUserNameActionTypeType;
  userName: string;
};

type SetSessionRoomCodeActionTypeType = "SET_SESSION_ROOM_CODE";
export const SetSessionRoomCodeActionType = "SET_SESSION_ROOM_CODE";
export type SetSessionRoomCodeAction = {
  type: SetSessionRoomCodeActionTypeType;
  roomCode: string;
};

export type SpokAction =
  | SetErrorAction
  | SetRoomAction
  | SetNotificationction
  | SetSessionUserNameAction
  | SetSessionRoomCodeAction;

export type SpokActionCreator = AsyncIterableIterator<SpokAction>;
