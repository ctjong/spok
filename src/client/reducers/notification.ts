import { SpokAction, SetNotificationActionType } from "../actions";
import constants from "../../constants";

export interface NotificationState {
  activeCode: string;
}

const initialState: NotificationState = {
  activeCode: null
};

export function notificationReducer(
  state: NotificationState = initialState,
  action: SpokAction
): NotificationState {
  if (action.type === SetNotificationActionType) {
    if (action.code === null) {
      return { ...state, activeCode: null };
    }

    // Don't update the notification code if the new code doesn't have a higher
    // severity than the active one.
    if (
      constants.fatalErrors.indexOf(state.activeCode) < 0 ||
      constants.fatalErrors.indexOf(action.code) >= 0
    ) {
      return { ...state, activeCode: action.code };
    }
  }

  return state;
}
