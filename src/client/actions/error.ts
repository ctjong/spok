import { SpokActionCreator, SetErrorActionType } from ".";

export async function* setError(msg: string): SpokActionCreator {
  yield { type: SetErrorActionType, msg };
}
