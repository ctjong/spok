import { SpokActionCreator, GoToActionType, GoToHomeActionType } from ".";

export async function* goTo(newPath: string): SpokActionCreator {
  yield { type: GoToActionType, newPath };
}

export async function* goToHome(): SpokActionCreator {
  yield { type: GoToHomeActionType };
}
