let io = null;


//--------------------------------------------------------------------------
// ENUMS
// These enums should be kept in sync with the enum in constants
//--------------------------------------------------------------------------

const msgEnums =
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
        PING: "ping",
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
};


//--------------------------------------------------------------------------
// Message handler
//--------------------------------------------------------------------------

const handleMessage = (socket, msg, reply) => 
{
    if(msg.target === msgEnums.targets.SERVER)
    {
        if(msg.type === msgEnums.types.CREATE_ROOM)
        {
            socket.join(msg.data.roomCode, () => 
            {
                reply({ isSuccess: true }); 
            });
        }
    }
    else
    {
        console.log("sending " + msg.type + " to " + msg.target + " from " + socket.id);
        msg.source = socket.id;
        const targetSocket = io.sockets.connected[msg.target];
        if(targetSocket)
        {
            if(msg.type === msgEnums.types.JOIN_RESPONSE && msg.data.isSuccess)
                targetSocket.join(msg.data.room);
            targetSocket.emit(msgEnums.events.MSG, msg, response => reply(response));
        }
        else
        {
            socket.to(msg.target).emit(msgEnums.events.MSG, msg);
        }
    }
};


//--------------------------------------------------------------------------
// Initialize
//--------------------------------------------------------------------------

module.exports = 
{
    initialize: (http) => 
    {
        io = require('socket.io')(http);
        io.on('connection', (socket) =>
        {
            socket.on(msgEnums.events.MSG, (msg, reply) => handleMessage(socket, msg, reply));
        });
    }
};