import { roomReducer, RoomState } from "./room";
import { ErrorState, errorReducer } from "./error";
import { notificationReducer, NotificationState } from "./notification";
import { chatReducer, ChatState } from "./chat";

export const reducers = {
  room: roomReducer,
  error: errorReducer,
  notification: notificationReducer,
  chat: chatReducer
};

export interface StoreShape {
  room: RoomState;
  error: ErrorState;
  notification: NotificationState;
  chat: ChatState;
}

export function returnType<R>(f: (...args: any[]) => R): { returnType: R } {
  return null!;
}
