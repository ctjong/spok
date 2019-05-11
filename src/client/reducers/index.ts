import { roomReducer, RoomState } from "./room";
import { notificationReducer, NotificationState } from "./notification";
import { chatReducer, ChatState } from "./chat";

export const reducers = {
  room: roomReducer,
  notification: notificationReducer,
  chat: chatReducer
};

export interface StoreShape {
  room: RoomState;
  notification: NotificationState;
  chat: ChatState;
}

export function returnType<R>(f: (...args: any[]) => R): { returnType: R } {
  return null!;
}
