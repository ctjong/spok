import { Room, ChatMessage } from "../../models";

export enum SpokActionType {
  SetErrorActionType,
  UpdateRoomActionType,
  SetRoomInfoActionType,
  SetNotificationActionType,
  PushChatActionType,
  GoToActionType,
  GoToHomeActionType
}

/*----------------------------------
  Error
----------------------------------*/

type SetErrorActionTypeType = "SET_ERROR";
export const SetErrorActionType = "SET_ERROR";
export type SetErrorAction = {
  type: SetErrorActionTypeType;
  msg: string;
};

/*----------------------------------
  Room
----------------------------------*/

type UpdateRoomActionTypeType = "UPDATE_ROOM";
export const UpdateRoomActionType = "UPDATE_ROOM";
export type UpdateRoomAction = {
  type: UpdateRoomActionTypeType;
  newRoom: Room;
};

type SetRoomInfoActionTypeType = "SET_ROOM_INFO";
export const SetRoomInfoActionType = "SET_ROOM_INFO";
export type SetRoomInfoAction = {
  type: SetRoomInfoActionTypeType;
  userName: string;
  roomCode: string;
};

/*----------------------------------
  Notification
----------------------------------*/

type SetNotificationActionTypeType = "SET_NOTIFICATION";
export const SetNotificationActionType = "SET_NOTIFICATION";
export type SetNotificationAction = {
  type: SetNotificationActionTypeType;
  code: string;
};

/*----------------------------------
  Chat
----------------------------------*/

type PushChatActionTypeType = "PUSH_CHAT";
export const PushChatActionType = "PUSH_CHAT";
export type PushChatAction = {
  type: PushChatActionTypeType;
  message: ChatMessage;
};

/*----------------------------------
  Navigation
----------------------------------*/

type GoToActionTypeType = "GO_TO";
export const GoToActionType = "GO_TO";
export type GoToAction = {
  type: GoToActionTypeType;
  newPath: string;
};

type GoToHomeActionTypeType = "GO_TO_HOME";
export const GoToHomeActionType = "GO_TO_HOME";
export type GoToHomeAction = {
  type: GoToHomeActionTypeType;
};

export type SpokAction =
  | SetErrorAction
  | UpdateRoomAction
  | SetRoomInfoAction
  | SetNotificationAction
  | PushChatAction
  | GoToAction
  | GoToHomeAction;

export type SpokActionCreator = AsyncIterableIterator<SpokAction>;
