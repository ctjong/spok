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
            PING: "ping",
            ACK: "ack",
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
            NAME_TAKEN_BYHOST: "nameTakenByHost",
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
        nameTakenByHost: "Name has been taken by host. Please choose another name.",
        roundOngoing: "A round is ongoing. Please try again later.",
        requestTimedOut: "Request timed out. Please try again later.",
    },

    TOTAL_PARTS: 4,
    ROOM_CODE: "roomCode",
    USER_NAME: "userName",
    DEFAULT_LANG: "en",
    REQUEST_TIMEOUT: 5000,
    JOIN_TIMEOUT: 5000,
    PING_INTERVAL: 10000,
};