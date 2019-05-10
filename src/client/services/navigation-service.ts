import { History } from "history";

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
}

export default new NavigationService();
