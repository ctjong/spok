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
        HOST: "host",
        OTHERS: "others",
        ALL: "all",
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
        msg.source = socket.id;
        console.log("sending " + msg.type + " to " + msg.target + " from " + socket.id);
        if(msg.target === msgEnums.targets.HOST || msg.target === msgEnums.targets.OTHERS)
            socket.to(msg.room).broadcast.emit(msgEnums.events.MSG, msg);
        else if(msg.target === msgEnums.targets.ALL)
            socket.to(msg.room).emit(msgEnums.events.MSG, msg);
        else
        {
            if(msg.type === msgEnums.types.JOIN_ROOM_RESPONSE && msg.data.isSuccess)
            {
                const targetSocket = io.sockets.connected[msg.target];
                targetSocket.join(msg.data.room);
            }
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