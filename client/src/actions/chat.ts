import { SpokActionCreator, PushChatActionType } from ".";
import { ChatMessage } from "spok-shared/models";

export async function* pushChat(message: ChatMessage): SpokActionCreator {
  yield { type: PushChatActionType, message };
}
