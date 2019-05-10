import { SpokActionCreator, SetNotificationctionType } from ".";

export async function* setNotification(code: string): SpokActionCreator {
  yield { type: SetNotificationctionType, code };
}

export async function* hideNotification(): SpokActionCreator {
  yield { type: SetNotificationctionType, code: null };
}
