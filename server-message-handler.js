const rooms = {};

//--------------------------------------------------------------------------
// ENUMS
// These enums should be kept in sync with the enum in view-model.js
//--------------------------------------------------------------------------

const msgEnums =
{
    types:
    {
        STATE_UPDATE: "stateUpdate",
        CREATE_ROOM: "createRoom",
        JOIN_ROOM: "joinRoom",
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
        MSG: "message"
    },
    errors:
    {
        ROOM_CODE_USED: "roomCodeUsed",
        USER_NAME_EXISTS: "userNameExists",
    }
};


//--------------------------------------------------------------------------
// Message handlers
//--------------------------------------------------------------------------

module.exports = (socket, msg, reply) => 
{
    if(msg.target === msgEnums.targets.SERVER)
    {
        if(msg.type === msgEnums.types.CREATE_ROOM)
        {
            if(rooms[msg.data.roomCode])
                reply({ isSuccess: false, msg: msgEnums.errors.ROOM_CODE_USED });
            else
            {
                socket.join(msg.data.roomCode, () => 
                { 
                    rooms[msg.data.roomCode] = { host: socket };
                    reply({ isSuccess: true }); 
                });
            }
        }
    }
    else if(msg.target === msgEnums.targets.HOST)
    {
        rooms[msg.room].host.emit(msgEnums.events.MSG, msg, (response) => 
        {
            if(response.isSuccess)
            {
                if(msg.type === ViewModel.msgEnums.types.JOIN_ROOM)
                    socket.join(msg.room);
            }
            reply(response); 
        });
    }
    else if(msg.target === msgEnums.targets.OTHERS)
    {
        socket.to(msg.room).broadcast.emit(msgEnums.events.MSG, msg);
    }
    else
    {
        socket.to(msg.room).emit(msgEnums.events.MSG, msg);
    }
};