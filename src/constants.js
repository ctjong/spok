export default 
{
    // Message enums. This should be kept in sync with the enums in server-socket-hub.
    msg:
    {
        types:
        {
            CREATE_ROOM: "createRoom",
            JOIN_REQUEST: "joinRoomRequest",
            JOIN_RESPONSE: "joinRoomResponse",
            SUBMIT_PART: "submitPart",
            START_ROUND: "startRound",
            GOTO_LOBBY: "gotoLobby",
            PLAYER_JOINED: "playerJoined",
            CHAT_MESSAGE: "chatMsg",
            PLAYER_OFFLINE: "playerOffline",
            HOST_CHANGE: "hostChange",
            KICK_PLAYER: "kickPlayer",
            VOTE: "vote",
        },
        targets:
        {
            SERVER: "server",
        },
        events:
        {
            CONNECT: "connect",
            MSG: "message"
        },
        errors:
        {
            USER_NAME_EXISTS: "userNameExists",
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
        userNameExists: "User name is already taken.",
        roundOngoing: "A round is ongoing. Please try again later.",
    },

    TOTAL_PARTS: 4,
    ROOM_CODE: "roomCode",
    USER_NAME: "userName",
    DEFAULT_LANG: "en",
    RESPONSE_TIMEOUT: 4000,
    SKIPPED_PART_STRING: "____",
};