const Models = require ('./src/models');
const Constants = require("./src/constants");

let io = null;
const rooms = {};
const socketToRoomMap = {};


//--------------------------------------------------------------------------
// MESSAGE HANDLERS
//--------------------------------------------------------------------------

const broadcast = (msg) =>
{
    console.log("sending " + msg.type + " to " + msg.roomCode);
    socket.to(msg.roomCode).emit(Constants.msg.events.MSG, msg);
};

const broadcastStateUpdate = (socket, roomCode) =>
{
    broadcast(new Models.StateUpdateMessage(roomCode, socket.id, room.gameState));
};

const broadcastSystemChat = (roomCode, text) =>
{
    broadcast(new Models.ChatMessage(roomCode, null, text));
};

const updateWritePhaseState = (room) =>
{
    let readyToProceed = true;
    Object.keys(room.gameState.players).forEach(userName => 
        {
            const paperId = room.gameState.players[userName].paperId;
            const paper = room.gameState.papers[paperId];
            if(paper && !paper.parts[room.gameState.activePart])
                readyToProceed = false;
        });

    if(readyToProceed)
    {
        if(room.gameState.activePart >= Constants.TOTAL_PARTS - 1)
            room.gameState.phase = Constants.phases.REVEAL;
        else
        {
            movePapers();
            room.gameState.activePart++;
        }
    }
};

const movePapers = (room) =>
{
    const players = room.gameState.players;
    const userNames = Object.keys(players);
    userNames.sort();

    const firstPaperId = players[userNames[0]].paperId;
    userNames.forEach((userName, index) => 
    {
        players[userName].paperId = (index < userNames.length - 1) ? 
            players[userNames[index+1]].paperId : firstPaperId;
    });
};

const getPlayerBySocketId = (room, socketId) =>
{
    let player = null;
    Object.keys(room.gameState.players).some(userName =>
    {
        if(room.gameState.players[userName].socketId === socketId)
        {
            player = room.gameState.players[userName];
            return true;
        }
        return false;
    });
    return player;
};

const handleCreateRoom = (socket, msg, reply) =>
{
    const roomCode = msg.data.roomCode;
    const lang = msg.data.lang;
    socketToRoomMap[socket.id] = roomCode;
    rooms[roomCode] = new Models.Room(roomCode, lang, socket);
    socket.join(roomCode, () => 
    {
        console.log("sending success response to " + socket.id);
        reply({ isSuccess: true });
    });
};

const handleJoinRequest = (socket, msg, reply) => 
{
    const roomCode = msg.data.roomCode;
    const room = rooms[roomCode];

    // if round is currently ongoing and the request is not for reconnection, reject it.
    const existingPlayer = room.gameState.players[msg.data.userName];
    if (!existingPlayer && room.gameState.phase > Constants.phases.LOBBY)
    {
        reply(new Models.ErrorResponse(Constants.errorStrings.ROUND_ONGOING));
        return;
    }

    // if the requested username is the same as the host user name, reject it.
    if (existingPlayer && existingPlayer.userName === Game.userName)
    {
        reply(new Models.ErrorResponse(Constants.errorStrings.NAME_TAKEN_BY_HOST));
        return;
    }

    // accept the request if:
    // - the chosen name is already present in the room (reconnect attempt), OR
    // - people are in the lobby
    const newPlayer = new Models.Player(msg.data.userName, msg.source);
    if(existingPlayer)
    {
        existingPlayer.isOnline = true;
        existingPlayer.socketId = newPlayer.socketId;
        broadcastSystemChat(roomCode, `${existingPlayer.userName} has reconnected`);
    }
    else
    {
        room.gameState.players[newPlayer.userName] = newPlayer;
        broadcastSystemChat(roomCode, `${newPlayer.userName} has joined`);
    }

    broadcastStateUpdate(socket, roomCode);
    reply(new Models.JoinApprovedResponse(room.gameState));
};

const handleSubmitPart = (socket, msg, reply) =>
{
    const part = msg.part;
    const roomCode = msg.data.roomCode;
    const room = rooms[roomCode];
    const paper = room.gameState.papers[part.paperId];
    if(!paper)
    {
        reply(new Models.ErrorResponse(Constants.errorStrings.SUBMIT_PART_FAILED));
        return;
    }
    paper.parts[room.gameState.activePart] = part;
    updateWritePhaseState();
    broadcastStateUpdate(socket, roomCode);
};

const handleServerMessage = (socket, msg, reply) =>
{
    const roomCode = msg.data.roomCode;
    const room = rooms[roomCode];
    switch(msg.type)
    {
        case Constants.msg.types.CREATE_ROOM:
            handleCreateRoom(socket, msg, reply);
            break;
        case Constants.msg.types.JOIN_REQUEST:
            handleJoinRequest(socket, msg, reply);
            break;
        case Constants.msg.types.SUBMIT_PART:
            handleSubmitPart(socket, msg, reply);
            break;
        default:
            break;
    }
};

const handleBroadcastMessage = (socket, msg, reply) =>
{
    console.log("sending " + msg.type + " to " + msg.target + " from " + socket.id);
    msg.source = socket.id;
    const targetSocket = io.sockets.connected[msg.target];
    if(targetSocket)
    {
        // message is for a specific person
        if(msg.type === Constants.msg.types.JOIN_RESPONSE && msg.data.isSuccess)
        {
            const roomCode = msg.data.roomCode;
            socketToRoomMap[targetSocket.id] = roomCode;
            if(rooms[roomCode])
                rooms[roomCode].sockets[targetSocket.id] = targetSocket;
            targetSocket.join(roomCode);
        }
        targetSocket.emit(Constants.msg.events.MSG, msg, response => reply(response));
    }
    else if(!rooms[msg.target])
    {
        // message is for a room but the room doesn't exist
        console.log("sending ROOM_NOT_EXIST to " + socket.id);
        socket.emit(Constants.msg.events.MSG, { type: Constants.msg.types.ROOM_NOT_EXIST });
    }
    else
    {
        // message is for a room and the room exists
        socket.to(msg.target).emit(Constants.msg.events.MSG, msg);
    }
};

const handleDisconnect = (socket) =>
{
    const roomCode = socketToRoomMap[socket.id];
    delete socketToRoomMap[socket.id];
    if(!roomCode || !rooms[roomCode])
        return;

    const room = rooms[roomCode];
    delete room.sockets[socket.id];
    if(Object.keys(room.sockets).length === 0)
    {
        // if there is no more active socket in the room, destroy the room
        delete rooms[roomCode];
        return;
    }

    const dcSocketId = socket.id;
    const dcPlayer = getPlayerBySocketId(room, dcSocketId);
    if(dcPlayer)
    {
        dcPlayer.isOnline = false;
        broadcastSystemChat(roomCode, `${dcPlayer.userName} has disconnected`);
        broadcastStateAndUpdateUI();
    }
    console.log("sending disconnect signal for " + socket.id + " to " + roomCode);
    broadcast(new Models.ConnectionMessage(dcSocketId, false));
};

const handleReconnect = (socket) =>
{
    const roomCode = socketToRoomMap[socket.id];
    delete socketToRoomMap[socket.id];
    if(!roomCode)
        return;
    console.log("sending reconnect signal for " + socket.id + " to " + roomCode);
    socket.to(roomCode).emit(Constants.msg.events.MSG, { type: Constants.msg.types.OTHER_PLAYER_RC, data: { socketId: socket.id }});
};


//--------------------------------------------------------------------------
// ENTRY POINT
//--------------------------------------------------------------------------

module.exports = 
{
    initialize: (http) => 
    {
        io = require('socket.io')(http);
        io.on('connection', (socket) =>
        {
            socket.on(Constants.msg.events.MSG, (msg, reply) => 
            {
                if(msg.target === Constants.msg.targets.SERVER)
                    handleServerMessage(socket, msg, reply);
                else
                    handleBroadcastMessage(socket, msg, reply);
            });
            socket.on(Constants.msg.events.DISCONNECT, () => handleDisconnect(socket));
            socket.on(Constants.msg.events.RECONNECT, () => handleReconnect(socket));
        });
    }
};