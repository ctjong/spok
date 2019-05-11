import { roomReducer, RoomState } from "./room";
import { notificationReducer, NotificationState } from "./notification";
import { chatReducer, ChatState } from "./chat";
import { navigationReducer, NavigationState } from "./navigation";

export const reducers = {
  room: roomReducer,
  notification: notificationReducer,
  chat: chatReducer,
  navigation: navigationReducer
};

export interface StoreShape {
  room: RoomState;
  notification: NotificationState;
  chat: ChatState;
  navigation: NavigationState;
}

export function returnType<R>(f: (...args: any[]) => R): { returnType: R } {
  return null!;
}
