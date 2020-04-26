import { Room } from "./client-models";
import constants from "./client-constants";

const util = {
  getRandomCode() {
    return Math.floor((1 + Math.random()) * 0x1000000000).toString(16);
  },

  isHostUser(room: Room, userName: string) {
    return room && room.hostUserName === userName;
  },

  isInRoomView() {
    return window.location.pathname.indexOf(constants.ROOM_PATH) === 0;
  },

  isInHomeView() {
    return window.location.pathname === constants.HOME_PATH;
  },
}

export default util;
