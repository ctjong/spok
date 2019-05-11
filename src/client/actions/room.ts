import {
  SpokActionCreator,
  UpdateRoomActionType,
  SetNotificationActionType,
  SetRoomInfoActionType,
  GoToHomeActionType
} from ".";
import {
  Room,
  StateResponse,
  StateRequestMessage,
  JoinRequestMessage,
  CreateRoomMessage,
  RoomJoinedResponse
} from "../../models";
import constants from "../../constants";
import clientSocket from "../services/client-socket";
import util from "../../util";

/**
 * Update room data
 * @param room room data
 */
export async function* updateRoom(room: Room): SpokActionCreator {
  yield { type: UpdateRoomActionType, newRoom: room };
}

/**
 * Sync room data with the server
 * @param userName user name
 * @param roomCode room code
 */
export async function* syncRoom(
  userName: string,
  roomCode: string
): SpokActionCreator {
  console.log("[syncRoom]", userName, roomCode);
  if (!util.isInRoomView()) return;

  yield {
    type: SetNotificationActionType,
    code: constants.notifCodes.SYNCING_STATE
  };

  const response: StateResponse = (await clientSocket.send(
    new StateRequestMessage(roomCode, userName)
  )) as StateResponse;

  yield {
    type: SetNotificationActionType,
    code: null
  };

  yield { type: UpdateRoomActionType, newRoom: response.state };
}

/**
 * Exit the room
 * @param errorCode error code. Set to null to exit gracefully.
 */
export async function* exitRoom(errorCode: string): SpokActionCreator {
  console.log("[exitRoom]", errorCode);
  if (errorCode) yield { type: SetNotificationActionType, code: errorCode };
  yield { type: UpdateRoomActionType, newRoom: null };
  yield { type: SetRoomInfoActionType, userName: null, roomCode: null };
  sessionStorage.setItem(constants.USER_NAME_SSKEY, null);
  clientSocket.close();
  if (!util.isInHomeView()) {
    yield { type: GoToHomeActionType };
  }
}

/**
 * Join a room
 * @param userName user name
 * @param roomCode room code
 */
export async function* joinRoom(
  userName: string,
  roomCode: string
): SpokActionCreator {
  console.log("[joinRoom]", userName, roomCode);
  sessionStorage.setItem(constants.USER_NAME_SSKEY, userName);
  yield { type: SetRoomInfoActionType, userName, roomCode };
  const response: RoomJoinedResponse = (await clientSocket.send(
    new JoinRequestMessage(roomCode, userName)
  )) as RoomJoinedResponse;
  yield { type: UpdateRoomActionType, newRoom: response.roomState };
}

/**
 * Create a room
 * @param userName user name
 * @param lang language name
 */
export async function* createRoom(
  userName: string,
  lang: string
): SpokActionCreator {
  console.log("[createRoom]", userName, lang);
  const roomCode = util.getRandomCode().substring(0, 5);
  sessionStorage.setItem(constants.USER_NAME_SSKEY, userName);
  yield { type: SetRoomInfoActionType, userName, roomCode };
  const response: RoomJoinedResponse = (await clientSocket.send(
    new CreateRoomMessage(roomCode, userName, lang)
  )) as RoomJoinedResponse;
  yield { type: UpdateRoomActionType, newRoom: response.roomState };
}
