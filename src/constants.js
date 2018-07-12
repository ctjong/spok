const Constants = {};

Constants.msgTypes =
{
    CREATE_ROOM: "createRoom",
    JOIN_REQUEST: "joinRoomRequest",
    SUBMIT_PART: "submitPart",
    CHAT_MESSAGE: "chatMsg",
    STATE_UPDATE: "stateUpdate",
    STATE_REQUEST: "stateRequest",
    GO_TO_LOBBY: "goToLobby",
    KICK_PLAYER: "kickPlayer",
    SET_AS_HOST: "setAsHost",
    START_ROUND: "startRound",
    SCORE_UPDATE: "scoreUpdate",
    OTHER_PLAYER_DC: "otherPlayerDC",
    OTHER_PLAYER_RC: "otherPlayerRC",
};

Constants.eventNames =
{
    CONNECT: "connect",
    DISCONNECT: "disconnect",
    RECONNECT: "reconnect",
    MSG: "message"
};

Constants.phases =
{
    LOBBY: 1,
    WRITE: 2,
    REVEAL: 3
};

Constants.notifStrings =
{
    NAME_TAKEN_BY_HOST: "Name has been taken by host. Please choose another name.",
    ROUND_ONGOING: "A round is ongoing. Please try again later.",
    REQUEST_TIMED_OUT: "Request timed out. Please try again later.",
    HOST_DISCONNECTED: "Host is disconnected. Please wait for host to reconnect.",
    CLIENT_DISCONNECTED: "You were disconnected. Please wait while we try to reconnect you.",
    SYNCING_STATE: "We are syncing with the host. Please wait.",
    SUBMIT_PART_FAILED: "An error occurred while trying to submit your input. Please try again later.",
    ROOM_NOT_EXIST: "Room does not exist. Please create a new room.",
    UNKNOWN_ERROR: "An unknown error occurred. Please try again later.",
};

Constants.INITIAL_PHASE =Constants.phases.LOBBY;
Constants.TOTAL_PARTS = 4;
Constants.ROOM_CODE_SSKEY = "roomCode";
Constants.USER_NAME_SSKEY = "userName";
Constants.DEFAULT_LANG = "en";
Constants.JOIN_TIMEOUT = 5000;
Constants.STATE_REFRESH_TIMEOUT = 5000;
Constants.HOME_PATH = "/";

module.exports = Constants;