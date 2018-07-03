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
            PLAYER_OFFLINE: "playerOffline",
            SCORE_UPDATE: "scoreUpdate",
            STATE_UPDATE: "stateUpdate",
            STATE_REQUEST: "stateRequest",
        },
        targets:
        {
            SERVER: "server",
        },
        events:
        {
            CONNECT: "connect",
            DISCONNECT: "disconnect",
            MSG: "message"
        },
        errors:
        {
            ROUND_ONGOING: "roundOngoing",
            TIMEOUT: "timeout",
        }
    },

    phases:
    {
        LOBBY: 1,
        WRITE: 2,
        REVEAL: 3
    },

    errorStrings:
    {
        roundOngoing: "A round is ongoing. Please try again later.",
        requestTimedOut: "Request timed out. Please try again later.",
    },

    TOTAL_PARTS: 4,
    ROOM_CODE: "roomCode",
    USER_NAME: "userName",
    DEFAULT_LANG: "en",
    REQUEST_TIMEOUT: 2000,
};