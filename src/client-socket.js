import io from 'socket.io-client';
import ViewModel from './view-model';
import Constants from './constants';
const ClientSocket = {};


//-------------------------------------------
// PRIVATE VARIABLES
//-------------------------------------------

let socket = null;
let responseHandlers = {};


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
    return socketSend(type, ViewModel.getRoomCode(), data, responseMsgType);
};

ClientSocket.getSocketId = () => 
{
    if(!socket)
        return null;
    return socket.id;
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
            console.log("sending " + JSON.stringify({ type, target, data, source:socket.id }));
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
            socket.on(Constants.msg.events.MSG, msg => 
            {
                console.log("received " + JSON.stringify(msg));
                ViewModel.handleMessage(msg);
                while(responseHandlers[msg.type] && responseHandlers[msg.type].length > 0)
                {
                    const resolve = responseHandlers[msg.type].pop();
                    resolve(msg);
                }
            });
            ViewModel.socket = ClientSocket;
            resolve();
        });
    });
};

export default ClientSocket;