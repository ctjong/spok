import { Room, ChatMessage } from "../../models";

export enum SpokActionType {
  SetErrorActionType,
  UpdateRoomActionType,
  SetRoomInfoActionType,
  SetRoomPromptStatusActionType,
  SetNotificationActionType,
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

type SetRoomInfoActionTypeType = "SET_ROOM_INFO";
export const SetRoomInfoActionType = "SET_ROOM_INFO";
export type SetRoomInfoAction = {
  type: SetRoomInfoActionTypeType;
  userName: string;
  roomCode: string;
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
  | SetRoomInfoAction
  | SetRoomPromptStatusAction
  | SetNotificationAction
  | PushChatAction;

export type SpokActionCreator = AsyncIterableIterator<SpokAction>;
