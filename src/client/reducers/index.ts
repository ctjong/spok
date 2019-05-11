import { roomReducer, RoomState } from "./room";
import { ErrorState, errorReducer } from "./error";
import { notificationReducer, NotificationState } from "./notification";
import { SessionState, sessionReducer } from "./session";
import { chatReducer, ChatState } from "./chat";

export const reducers = {
  room: roomReducer,
  error: errorReducer,
  notification: notificationReducer,
  session: sessionReducer,
  chat: chatReducer
};

export interface StoreShape {
  room: RoomState;
  error: ErrorState;
  notification: NotificationState;
  session: SessionState;
  chat: ChatState;
}

export function returnType<R>(f: (...args: any[]) => R): { returnType: R } {
  return null!;
}
