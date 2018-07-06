module.exports =
{
    msg:
    {
        types:
        {
            CREATE_ROOM: "createRoom",
            JOIN_REQUEST: "joinRoomRequest",
            JOIN_RESPONSE: "joinRoomResponse",
            SUBMIT_PART: "submitPart",
            CHAT_MESSAGE: "chatMsg",
            SCORE_UPDATE: "scoreUpdate",
            STATE_UPDATE: "stateUpdate",
            STATE_REQUEST: "stateRequest",
            OTHER_PLAYER_DC: "otherPlayerDC",
            OTHER_PLAYER_RC: "otherPlayerRC",
            ROOM_NOT_EXIST: "roomNotExist",
        },
        targets:
        {
            SERVER: "server",
        },
        events:
        {
            CONNECT: "connect",
            DISCONNECT: "disconnect",
            RECONNECT: "reconnect",
            MSG: "message"
        }
    },

    phases:
    {
        LOBBY: 1,
        WRITE: 2,
        REVEAL: 3
    },

    errorCodes:
    {
        NAME_TAKEN_BYHOST: "nameTakenByHost",
        ROUND_ONGOING: "roundOngoing",
        ROOM_NOT_EXIST: "roomNotExist",
    },

    errorStrings:
    {
        nameTakenByHost: "Name has been taken by host. Please choose another name.",
        roundOngoing: "A round is ongoing. Please try again later.",
        requestTimedOut: "Request timed out. Please try again later.",
        hostDisconnected: "Host is disconnected. Please wait for host to reconnect.",
        clientDisconnected: "You are disconnected. Please wait while we try to reconnect you.",
        syncingState: "We are syncing with the host. Please wait.",
    },

    TOTAL_PARTS: 4,
    ROOM_CODE_SSKEY: "roomCode",
    USER_NAME_SSKEY: "userName",
    GAME_STATE_SSKEY: "gameState",
    DEFAULT_LANG: "en",
    JOIN_TIMEOUT: 5000,
    STATE_REFRESH_TIMEOUT: 5000,
    HOME_PATH: "/",
};