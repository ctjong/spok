import { History } from "history";
import constants from "../../constants";

class NavigationService {
  history: History = null;
  registeredHistoryHandlerNames: string[] = [];

  goTo(path: string) {
    this.history.push(path);
  }

  setHistory(history: History) {
    this.history = history;
  }

  addHistoryChangeHandler(
    handlerName: string,
    handler: History.LocationListener
  ) {
    if (this.registeredHistoryHandlerNames.indexOf(handlerName) < 0) {
      this.registeredHistoryHandlerNames.push(handlerName);
      this.history.listen(handler);
    }
  }

  isInRoomView() {
    return this.history.location.pathname.indexOf(constants.ROOM_PATH) === 0;
  }

  isInHomeView() {
    return this.history.location.pathname === constants.HOME_PATH;
  }
}

export default new NavigationService();
