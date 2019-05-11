const constants: { [key: string]: any } = {};

constants.msgTypes = {
  CREATE_ROOM: "createRoom",
  JOIN_REQUEST: "joinRoomRequest",
  SUBMIT_PART: "submitPart",
  CHAT_MESSAGE: "chatMsg",
  ROOM_UPDATE: "stateUpdate",
  STATE_REQUEST: "stateRequest",
  GO_TO_LOBBY: "goToLobby",
  KICK_PLAYER: "kickPlayer",
  SET_AS_HOST: "setAsHost",
  START_ROUND: "startRound",
  SCORE_UPDATE: "scoreUpdate"
};

constants.eventNames = {
  MSG: "message",
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  CONNECT_ERROR: "connect_error"
};

constants.phases = {
  LOBBY: 1,
  WRITE: 2,
  REVEAL: 3
};

constants.notifCodes = {
  ROUND_ONGOING: "ROUND_ONGOING",
  CLIENT_DISCONNECTED: "CLIENT_DISCONNECTED",
  SYNCING_STATE: "SYNCING_STATE",
  SUBMIT_PART_FAILED: "SUBMIT_PART_FAILED",
  ROOM_NOT_EXIST: "ROOM_NOT_EXIST",
  PLAYER_KICKED: "PLAYER_KICKED",
  REQUEST_TIMEOUT: "REQUEST_TIMEOUT",
  NOT_IN_ROOM: "NOT_IN_ROOM",
  CONNECT_ERROR: "CONNECT_ERROR",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
  LOADING: "LOADING",
  RECONNECTING: "RECONNECTING",
  INVALID_ARGUMENT: "INVALID_ARGUMENT"
};

constants.notifStrings = {};
constants.notifStrings[constants.notifCodes.ROUND_ONGOING] =
  "A round is ongoing. Please try again later.";
constants.notifStrings[constants.notifCodes.CLIENT_DISCONNECTED] =
  "You were disconnected. Please wait while we try to reconnect you.";
constants.notifStrings[constants.notifCodes.SYNCING_STATE] =
  "Syncing with server. Please wait.";
constants.notifStrings[constants.notifCodes.SUBMIT_PART_FAILED] =
  "An error occurred while trying to submit your input. Please try again later.";
constants.notifStrings[constants.notifCodes.ROOM_NOT_EXIST] =
  "Room does not exist. Please create a new room or join another one.";
constants.notifStrings[constants.notifCodes.PLAYER_KICKED] =
  "You have been removed from the game, either because you joined on another device or you were kicked by the host.";
constants.notifStrings[constants.notifCodes.REQUEST_TIMEOUT] =
  "Request timed out. Please try again later.";
constants.notifStrings[constants.notifCodes.NOT_IN_ROOM] =
  "You haven't joined the room. Please join the room first.";
constants.notifStrings[constants.notifCodes.CONNECT_ERROR] =
  "Failed to connect with server. Please try again later.";
constants.notifStrings[constants.notifCodes.UNKNOWN_ERROR] =
  "An unknown error occurred. Please try again later.";
constants.notifStrings[constants.notifCodes.LOADING] =
  "Loading data. Please wait";
constants.notifStrings[constants.notifCodes.RECONNECTING] =
  "Reconnecting. Please wait.";

constants.fatalErrors = [
  constants.notifCodes.ROOM_NOT_EXIST,
  constants.notifCodes.PLAYER_KICKED,
  constants.notifCodes.CLIENT_DISCONNECTED,
  constants.notifCodes.NOT_IN_ROOM,
  constants.notifCodes.CONNECT_ERROR
];

constants.INITIAL_PHASE = constants.phases.LOBBY;
constants.TOTAL_PARTS = 4;
constants.USER_NAME_SSKEY = "userName";
constants.DEFAULT_LANG = "en";
constants.REQUEST_TIMEOUT = 20000;
constants.HOME_PATH = "/";
constants.ROOM_PATH = "/room";
constants.RECONNECT_TIMEOUT = 300000;
constants.RECONNECT_INTERVAL = 1000;

export default constants;
