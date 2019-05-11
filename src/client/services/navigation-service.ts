import { History } from "history";
import constants from "../../constants";
import { createBrowserHistory } from "history";

class NavigationService {
  history: History = null;

  initialize(history: History) {
    this.history = history;
  }

  goTo(path: string) {
    this.history.push(path);
  }

  isInRoomView() {
    return this.history.location.pathname.indexOf(constants.ROOM_PATH) === 0;
  }

  isInHomeView() {
    return this.history.location.pathname === constants.HOME_PATH;
  }
}

export default new NavigationService();
