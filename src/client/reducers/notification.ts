import { SpokAction, SetNotificationActionType } from "../actions";

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
    return { ...state, activeCode: action.code };
  }

  return state;
}
