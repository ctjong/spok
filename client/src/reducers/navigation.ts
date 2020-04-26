import { SpokAction, GoToActionType, GoToHomeActionType } from "../actions";
import constants from "spok-shared/constants";

export interface NavigationState {
  path: string;
}

const initialState: NavigationState = {
  path: window.location.pathname
};

export function navigationReducer(
  state: NavigationState = initialState,
  action: SpokAction
): NavigationState {
  if (action.type === GoToActionType) {
    return { ...state, path: action.newPath };
  } else if (action.type === GoToHomeActionType) {
    return { ...state, path: constants.HOME_PATH };
  }

  return state;
}
