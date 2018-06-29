export default 
{
    // Message enums. This should be kept in sync with the enums in server-socket.
    msg:
    {
        types:
        {
            STATE_UPDATE: "stateUpdate",
            CREATE_ROOM: "createRoom",
            JOIN_ROOM_REQUEST: "joinRoomRequest",
            JOIN_ROOM_RESPONSE: "joinRoomResponse",
            SUBMIT_PART: "submitPart",
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