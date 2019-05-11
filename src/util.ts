import { Room } from "./models";

class Util {
  getRandomCode() {
    return Math.floor((1 + Math.random()) * 0x1000000000).toString(16);
  }

  isHostUser(room: Room, userName: string) {
    return room && room.hostUserName === userName;
  }
}

export default new Util();
