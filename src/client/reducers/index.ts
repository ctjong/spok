import { Room } from "models";
import { roomReducer } from "./room";
import { ErrorState, errorReducer } from "./error";

export const reducers = {
  room: roomReducer,
  error: errorReducer
};

export interface StoreShape {
  room: Room;
  error: ErrorState;
}

export function returnType<R>(f: (...args: any[]) => R): { returnType: R } {
  return null!;
}
