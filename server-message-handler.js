const rooms = {};

module.exports = (socket, msg, reply) => 
{
    if(msg.target === "server")
    {
        if(msg.type === "createRoom")
        {
            if(rooms[msg.data.roomCode])
                reply({ isSuccess: false, msg: "roomCodeUsed" });
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
    else if(msg.target === "host")
    {
        rooms[msg.room].host.emit("message", msg, (response) => 
        {
            if(response.isSuccess)
            {
                if(msg.type === "joinRoom")
                    socket.join(msg.room);
            }
            reply(response); 
        });
    }
    else if(msg.target === "others")
    {
        socket.to(msg.room).broadcast.emit("message", msg);
    }
    else
    {
        socket.to(msg.room).emit("message", msg);
    }
};