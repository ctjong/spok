import { History } from "history";

class Util {
  history: History = null;

  getRandomCode() {
    return Math.floor((1 + Math.random()) * 0x1000000000).toString(16);
  }

  goTo(path: string) {
    this.history.push(path);
  }

  initHistory(history: History) {
    this.history = history;
  }

  addHistoryChangeHandler(handler: History.LocationListener) {
    this.history.listen(handler);
  }
}

export default new Util();
