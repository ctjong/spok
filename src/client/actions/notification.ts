import { SpokActionCreator, SetNotificationActionType } from ".";

export async function* setNotification(code: string): SpokActionCreator {
  yield { type: SetNotificationActionType, code };
}

export async function* hideNotification(): SpokActionCreator {
  yield { type: SetNotificationActionType, code: null };
}
