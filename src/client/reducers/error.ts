import { SpokAction, SetErrorActionType } from "../actions";

export interface ErrorState {
  errorMessage: string;
}

const initialState: ErrorState = {
  errorMessage: null
};

export function errorReducer(
  state: ErrorState = initialState,
  action: SpokAction
): ErrorState {
  if (action.type === SetErrorActionType) {
    return { ...state, errorMessage: action.msg };
  }

  return state;
}
