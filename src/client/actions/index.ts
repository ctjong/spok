import { Room, ChatMessage } from "../../models";

export enum SpokActionType {
  SetErrorActionType,
  UpdateRoomActionType,
  SetRoomPromptStatusActionType,
  SetNotificationActionType,
  SetSessionUserNameActionType,
  SetSessionRoomCodeActionType,
  PushChatActionType
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

type SetRoomPromptStatusActionTypeType = "SET_ROOM_PROMPT_STATUS";
export const SetRoomPromptStatusActionType = "SET_ROOM_PROMPT_STATUS";
export type SetRoomPromptStatusAction = {
  type: SetRoomPromptStatusActionTypeType;
  isEnabled: boolean;
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
  Session
----------------------------------*/

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

/*----------------------------------
  Chat
----------------------------------*/

type PushChatActionTypeType = "PUSH_CHAT";
export const PushChatActionType = "PUSH_CHAT";
export type PushChatAction = {
  type: PushChatActionTypeType;
  message: ChatMessage;
};

export type SpokAction =
  | SetErrorAction
  | UpdateRoomAction
  | SetRoomPromptStatusAction
  | SetNotificationAction
  | SetSessionUserNameAction
  | SetSessionRoomCodeAction
  | PushChatAction;

export type SpokActionCreator = AsyncIterableIterator<SpokAction>;
