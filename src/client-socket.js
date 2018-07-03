import io from 'socket.io-client';
import Constants from './constants';

const ClientSocket = {};
ClientSocket.roomCode = null;


//-------------------------------------------
// PRIVATE VARIABLES
//-------------------------------------------

const oneTimeHandlers = [];
const messageHandlers = [];

let initPromise = null;
let socket = null;

//-------------------------------------------
// PUBLIC FUNCTIONS
//-------------------------------------------

ClientSocket.sendToServer = (type, data) => 
{
    return socketSend(type, Constants.msg.targets.SERVER, data);
};

ClientSocket.sendToId = (type, targetId, data) => 
{
    return socketSend(type, targetId, data);
};

ClientSocket.sendToCurrentRoom = (type, data) => 
{
    return socketSend(type, ClientSocket.roomCode, data);
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

ClientSocket.addOneTimeHandler = (msgType, successHandler, timeout, timeoutHandler) =>
{
    const timer = !timeoutHandler ? null : setTimeout(timeoutHandler, timeout);
    oneTimeHandlers[msgType] = (msg) => 
    {
        clearTimeout(timer);
        if(successHandler)
            successHandler(msg);
    };
};

ClientSocket.tryClose = () =>
{
    if(!socket)
        return;
    console.log("[ClientSocket.tryClose] socket closed");
    socket.close();
    socket = null;
    initPromise = null;
};

ClientSocket.reset = () =>
{
    ClientSocket.tryClose();
    return initSocket();
};


//-------------------------------------------
// PRIVATE FUNCTIONS
//-------------------------------------------

const socketSend = (type, target, data) => 
{
    return new Promise((resolve) => 
    {
        initSocket().then(() => 
        {
            console.log("[ClientSocket.socketSend] sending " + JSON.stringify({ type, target, data, source:socket.id }));
            socket.emit(Constants.msg.events.MSG, { type, target, data }, response => resolve(response));
        });
    });
};

const socketReceive = (msg, reply) =>
{
    console.log("[ClientSocket.socketReceive] received " + JSON.stringify(msg));
    messageHandlers.forEach(handler => handler(msg, reply));
    if(oneTimeHandlers[msg.type])
    {
        oneTimeHandlers[msg.type](msg);
        oneTimeHandlers[msg.type] = null;
    }
};

const initSocket = () =>
{
    if(initPromise)
        return initPromise;
    initPromise = new Promise(resolve => 
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
    return initPromise;
};

export default ClientSocket;