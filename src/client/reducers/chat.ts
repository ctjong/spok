import { SpokAction, PushChatActionType } from "../actions";
import { ChatMessage } from "../../models";

export interface ChatState {
  messages: ChatMessage[];
}

const initialState: ChatState = {
  messages: []
};

export function chatReducer(
  state: ChatState = initialState,
  action: SpokAction
): ChatState {
  if (action.type === PushChatActionType) {
    return { ...state, messages: [...state.messages, action.message] };
  }

  return state;
}
