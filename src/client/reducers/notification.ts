import { SpokAction, SetNotificationctionType } from "../actions";

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
  if (action.type === SetNotificationctionType) {
    return { ...state, activeCode: action.code };
  }

  return state;
}
