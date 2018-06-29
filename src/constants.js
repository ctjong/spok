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
        }
    },

    phases:
    {
        LOBBY: 1,
        WRITE: 2,
        REVEAL: 3
    },

    TOTAL_PARTS: 4,
    ROOM_CODE: "roomCode",
    USER_NAME: "userName",
    DEFAULT_LANG: "en",
};