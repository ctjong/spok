const Constants: { [key: string]: any } = {};

Constants.msgTypes = {
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

Constants.eventNames = {
  MSG: "message",
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  CONNECT_ERROR: "connect_error"
};

Constants.phases = {
  LOBBY: 1,
  WRITE: 2,
  REVEAL: 3
};

Constants.notifCodes = {
  ROUND_ONGOING: 0,
  CLIENT_DISCONNECTED: 1,
  SYNCING_STATE: 2,
  SUBMIT_PART_FAILED: 3,
  ROOM_NOT_EXIST: 4,
  JOIN_ANOTHER_DEVICE: 5,
  REQUEST_TIMEOUT: 6,
  NOT_IN_ROOM: 7,
  CONNECT_ERROR: 8,
  UNKNOWN_ERROR: 9,
  LOADING: 10,
  RECONNECTING: 11
};

Constants.notifStrings = {};
Constants.notifStrings[Constants.notifCodes.ROUND_ONGOING] =
  "A round is ongoing. Please try again later.";
Constants.notifStrings[Constants.notifCodes.CLIENT_DISCONNECTED] =
  "You were disconnected. Please wait while we try to reconnect you.";
Constants.notifStrings[Constants.notifCodes.SYNCING_STATE] =
  "Syncing with server. Please wait.";
Constants.notifStrings[Constants.notifCodes.SUBMIT_PART_FAILED] =
  "An error occurred while trying to submit your input. Please try again later.";
Constants.notifStrings[Constants.notifCodes.ROOM_NOT_EXIST] =
  "Room does not exist. Please create a new room or join another one.";
Constants.notifStrings[Constants.notifCodes.JOIN_ANOTHER_DEVICE] =
  "You have joined on another device so you have been removed on this one.";
Constants.notifStrings[Constants.notifCodes.REQUEST_TIMEOUT] =
  "Request timed out. Please try again later.";
Constants.notifStrings[Constants.notifCodes.NOT_IN_ROOM] =
  "You haven't joined the room. Please join the room first.";
Constants.notifStrings[Constants.notifCodes.CONNECT_ERROR] =
  "Failed to connect with server. Please try again later.";
Constants.notifStrings[Constants.notifCodes.UNKNOWN_ERROR] =
  "An unknown error occurred. Please try again later.";
Constants.notifStrings[Constants.notifCodes.LOADING] =
  "Loading data. Please wait";
Constants.notifStrings[Constants.notifCodes.RECONNECTING] =
  "Reconnecting. Please wait.";

Constants.fatalErrors = [
  Constants.notifCodes.ROOM_NOT_EXIST,
  Constants.notifCodes.JOIN_ANOTHER_DEVICE,
  Constants.notifCodes.CLIENT_DISCONNECTED,
  Constants.notifCodes.NOT_IN_ROOM,
  Constants.notifCodes.CONNECT_ERROR
];

Constants.INITIAL_PHASE = Constants.phases.LOBBY;
Constants.TOTAL_PARTS = 4;
Constants.ROOM_CODE_SSKEY = "roomCode";
Constants.USER_NAME_SSKEY = "userName";
Constants.DEFAULT_LANG = "en";
Constants.REQUEST_TIMEOUT = 20000;
Constants.HOME_PATH = "/";
Constants.RECONNECT_TIMEOUT = 300000;
Constants.RECONNECT_INTERVAL = 1000;

export default Constants;
