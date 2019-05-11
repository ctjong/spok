import {
  SpokActionCreator,
  UpdateRoomActionType,
  SetRoomPromptStatusActionType,
  SetNotificationActionType,
  SetRoomInfoActionType
} from ".";
import {
  Room,
  StateResponse,
  StateRequestMessage,
  JoinRequestMessage,
  CreateRoomMessage
} from "../../models";
import constants from "../../constants";
import clientSocket from "../services/client-socket";
import navigationService from "../services/navigation-service";
import util from "../../util";

/**
 * Update room data
 * @param room room data
 */
export async function* updateRoom(room: Room): SpokActionCreator {
  yield { type: UpdateRoomActionType, newRoom: room };
}

/**
 * Update the enabled/disabled status of the room prompt
 * @param isEnabled whether or not the prompt is enabled
 */
export async function* setRoomPromptStatus(
  isEnabled: boolean
): SpokActionCreator {
  yield { type: SetRoomPromptStatusActionType, isEnabled };
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
  if (!navigationService.isInRoomView()) return;

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
 * @param reasonCode reason for the exit
 */
export async function* exitRoom(reasonCode: string): SpokActionCreator {
  console.log("[exitRoom]", reasonCode);
  yield { type: SetNotificationActionType, code: reasonCode };
  yield { type: SetRoomPromptStatusActionType, isEnabled: false };
  yield { type: SetRoomInfoActionType, userName: null, roomCode: null };
  sessionStorage.setItem(constants.USER_NAME_SSKEY, null);

  clientSocket.close();
  if (!navigationService.isInHomeView()) {
    navigationService.goTo(constants.HOME_PATH);
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
  await clientSocket.send(new JoinRequestMessage(roomCode, userName));
  sessionStorage.setItem(constants.USER_NAME_SSKEY, userName);
  yield { type: SetRoomInfoActionType, userName, roomCode };
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
  await clientSocket.send(new CreateRoomMessage(roomCode, userName, lang));
  sessionStorage.setItem(constants.USER_NAME_SSKEY, userName);
  yield { type: SetRoomInfoActionType, userName, roomCode };
}
