import io from 'socket.io-client';
import Constants from './constants';

const ClientSocket = {};
ClientSocket.roomCode = null;


//-------------------------------------------
// PRIVATE VARIABLES
//-------------------------------------------

const responseHandlers = {};
const messageHandlers = [];

let socket = null;

//-------------------------------------------
// PUBLIC FUNCTIONS
//-------------------------------------------

ClientSocket.sendToServer = (type, data, responseMsgType) => 
{
    return socketSend(type, Constants.msg.targets.SERVER, data, responseMsgType);
};

ClientSocket.sendToId = (type, targetId, data, responseMsgType) => 
{
    return socketSend(type, targetId, data, responseMsgType);
};

ClientSocket.sendToCurrentRoom = (type, data, responseMsgType) => 
{
    return socketSend(type, ClientSocket.roomCode, data, responseMsgType);
};

ClientSocket.getSocketId = () => 
{
    if(!socket)
        return null;
    return socket.id;
};

ClientSocket.addMessageHandler = (handler) =>
{
    messageHandlers.push(handler);
};

ClientSocket.tryClose = () =>
{
    if(!socket)
        return;
    console.log("[ClientSocket.tryClose] socket closed");
    socket.close();
    socket = null;
};


//-------------------------------------------
// PRIVATE FUNCTIONS
//-------------------------------------------

const socketSend = (type, target, data, responseMsgType) => 
{
    return new Promise((resolve) => 
    {
        ensureInitialized().then(() => 
        {
            console.log("[ClientSocket.socketSend] sending " + JSON.stringify({ type, target, data, source:socket.id }));
            if(responseMsgType)
            {
                if(!responseHandlers[responseMsgType])
                    responseHandlers[responseMsgType] = [];
            }
            const ack = responseMsgType ? null : (response => resolve(response));
            socket.emit(Constants.msg.events.MSG, { type, target, data }, ack);
            if(responseMsgType)
                responseHandlers[responseMsgType].push(resolve);
        });
    });
};

const socketReceive = (msg, reply) =>
{
    console.log("[ClientSocket.socketReceive] received " + JSON.stringify(msg));
    messageHandlers.forEach(handler => handler(msg, reply));
    while(responseHandlers[msg.type] && responseHandlers[msg.type].length > 0)
    {
        const resolve = responseHandlers[msg.type].pop();
        resolve(msg);
    }
};

const ensureInitialized = () =>
{
    return new Promise(resolve => 
    {
        if(socket)
        {
            resolve();
            return;
        }
        const origin = (window.location.origin.indexOf("localhost") >= 0) ? "http://localhost:1337" : window.location.origin;
        socket = io(origin);
        socket.on(Constants.msg.events.CONNECT, () => 
        {
            socket.on(Constants.msg.events.MSG, socketReceive);
            resolve();
        });
    });
};

export default ClientSocket;