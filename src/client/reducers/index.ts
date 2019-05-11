import { Room } from "models";
import { roomReducer, RoomState } from "./room";
import { ErrorState, errorReducer } from "./error";
import { notificationReducer, NotificationState } from "./notification";
import { SessionState, sessionReducer } from "./session";

export const reducers = {
  room: roomReducer,
  error: errorReducer,
  notification: notificationReducer,
  session: sessionReducer
};

export interface StoreShape {
  room: RoomState;
  error: ErrorState;
  notification: NotificationState;
  session: SessionState;
}

export function returnType<R>(f: (...args: any[]) => R): { returnType: R } {
  return null!;
}
