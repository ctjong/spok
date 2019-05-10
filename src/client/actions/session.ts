import {
  SpokActionCreator,
  SetSessionUserNameActionType,
  SetSessionRoomCodeActionType
} from ".";

export async function* setSessionUserName(userName: string): SpokActionCreator {
  yield { type: SetSessionUserNameActionType, userName };
}

export async function* setSessionRoomCode(roomCode: string): SpokActionCreator {
  yield { type: SetSessionRoomCodeActionType, roomCode };
}
