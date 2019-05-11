import {
  SpokActionCreator,
  UpdateRoomActionType,
  SetRoomPromptStatusActionType,
  SetNotificationActionType
} from ".";
import { Room, StateResponse, StateRequestMessage } from "../../models";
import constants from "../../constants";
import clientSocket from "../services/client-socket";
import navigationService from "../services/navigation-service";

export async function* updateRoom(room: Room): SpokActionCreator {
  yield { type: UpdateRoomActionType, newRoom: room };
}

export async function* setRoomPromptStatus(
  isEnabled: boolean
): SpokActionCreator {
  yield { type: SetRoomPromptStatusActionType, isEnabled };
}

export async function* refreshState(
  userName: string,
  roomCode: string
): SpokActionCreator {
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

export async function* exitRoom(reasonCode: string): SpokActionCreator {
  console.log(`[exitRoom] Reason: ${reasonCode}`);
  yield {
    type: SetNotificationActionType,
    code: reasonCode
  };

  if (navigationService.isInRoomView()) {
    yield { type: SetRoomPromptStatusActionType, isEnabled: false };
  }

  sessionStorage.setItem(constants.USER_NAME_SSKEY, null);
  sessionStorage.setItem(constants.ROOM_CODE_SSKEY, null);

  clientSocket.close();
  if (navigationService.isInHomeView()) {
    navigationService.goTo(constants.HOME_PATH);
  }
}
