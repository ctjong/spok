let io = null;


//--------------------------------------------------------------------------
// ENUMS
// These enums should be kept in sync with the enum in client-socket
//--------------------------------------------------------------------------

const msgEnums =
{
    types:
    {
        STATE_UPDATE: "stateUpdate",
        CREATE_ROOM: "createRoom",
        JOIN_ROOM_REQUEST: "joinRoomRequest",
        JOIN_ROOM_RESPONSE: "joinRoomResponse",
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
            if(msg.type === msgEnums.types.JOIN_ROOM_RESPONSE && msg.data.isSuccess)
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