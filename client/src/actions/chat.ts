import { SpokActionCreator, PushChatActionType } from ".";
import { ChatMessage } from "../client-models";

export async function* pushChat(message: ChatMessage): SpokActionCreator {
  yield { type: PushChatActionType, message };
}
