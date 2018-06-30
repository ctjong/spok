let io = null;
const rooms = {};
const socketToRoomMap = {};

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
        PLAYER_OFFLINE: "playerOffline",
        HOST_CHANGE: "hostChange",
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
            const roomCode = msg.data.roomCode;
            const lang = msg.data.lang;
            socketToRoomMap[socket.id] = roomCode;
            rooms[roomCode] = { roomCode, lang, sockets: [socket.id] };
            console.log("sending success response to " + socket.id);
            socket.join(roomCode, () => reply({ isSuccess: true })); 
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
            {
                const roomCode = msg.data.roomCode;
                socketToRoomMap[targetSocket.id] = roomCode;
                if(rooms[roomCode])
                    rooms[roomCode].sockets.push(targetSocket.id);
                targetSocket.join(roomCode);
            }
            targetSocket.emit(msgEnums.events.MSG, msg, response => reply(response));
        }
        else
        {
            socket.to(msg.target).emit(msgEnums.events.MSG, msg);
        }
    }
};

const handleDisconnect = (socket) =>
{
    const roomCode = socketToRoomMap[socket.id];
    delete socketToRoomMap[socket.id];
    if(!roomCode)
        return;
    if(roomToSocketsMap[roomCode])
    {
        roomToSocketsMap[roomCode].sockets.remove(socket.id);
        if(roomToSocketsMap[roomCode].sockets.length === 0)
            delete roomToSocketsMap[roomCode];
    }
    socket.to(roomCode).emit(msgEnums.types.PLAYER_OFFLINE, { socketId: socket.id });
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
            socket.on(msgEnums.events.DISCONNECT, () => handleMessage(socket));
        });
    }
};