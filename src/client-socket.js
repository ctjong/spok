import io from 'socket.io-client';
import Constants from './constants';

const ClientSocket = {};


//-------------------------------------------
// PRIVATE VARIABLES
//-------------------------------------------

const messageHandlers = [];
const errorHandlers = [];
const disconnectHandlers = [];
const reconnectHandlers = [];

let initPromise = null;
let socket = null;

//-------------------------------------------
// PUBLIC FUNCTIONS
//-------------------------------------------

ClientSocket.send = (msg) => 
{
    return new Promise((resolve) => 
    {
        // prepare timeout timer
        let isTimedOut = false;
        const timer = setTimeout(() => 
        {
            console.log("[ClientSocket.send] request timed out. aborting.");
            isTimedOut = true;
            handleError(Constants.notifCodes.REQUEST_TIMEOUT);
        }, Constants.REQUEST_TIMEOUT);

        // init socket then fire request
        initSocket().then(() => 
        {
            if(!socket)
                return;

            console.log("[ClientSocket.send] sending " + JSON.stringify(msg));
            socket.emit(Constants.eventNames.MSG, msg, response => 
            {
                if(isTimedOut)
                {
                    console.log("[ClientSocket.send] response received after timeout. ignoring.");
                    return;
                }
                console.log("[ClientSocket.send] received response " + JSON.stringify(response));
                clearTimeout(timer);
                if(!response.isSuccess)
                    handleError(response.notifCode);
                resolve(response)
            });
        });
    });
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

ClientSocket.addErrorHandler = (handler) =>
{
    errorHandlers.push(handler);
};

ClientSocket.addDisconnectHandler = (handler) =>
{
    disconnectHandlers.push(handler);
};

ClientSocket.addReconnectHandler = (handler) =>
{
    reconnectHandlers.push(handler);
};

ClientSocket.close = () =>
{
    if(socket)
        socket.close();
    socket = null;
    initPromise = null;
};


//-------------------------------------------
// PRIVATE FUNCTIONS
//-------------------------------------------

const handleMessage = (msg) =>
{
    console.log("[ClientSocket.handleMessage] received " + JSON.stringify(msg));
    messageHandlers.forEach(handler => handler(msg));
};

const handleConnect = (callback) =>
{
    console.log("[ClientSocket.handleConnect]");
    callback();
};

const handleDisconnect = () =>
{
    console.log("[ClientSocket.handleDisconnect]");
    disconnectHandlers.forEach(handler => handler());
};

const handleReconnect = () =>
{
    console.log("[ClientSocket.handleReconnect]");
    reconnectHandlers.forEach(handler => handler());
};

const handleError = (notifCode) =>
{
    console.log("[ClientSocket.handleError]");
    errorHandlers.forEach(handler => handler(notifCode));
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
        socket.on(Constants.eventNames.MSG, msg => handleMessage(msg));
        socket.on(Constants.eventNames.CONNECT, () =>  handleConnect(resolve));
        socket.on(Constants.eventNames.DISCONNECT, () => handleDisconnect());
        socket.on(Constants.eventNames.RECONNECT, () => handleReconnect());
        socket.on(Constants.eventNames.CONNECT_ERROR, () => handleError(Constants.notifCodes.CONNECT_ERROR));
    });
    return initPromise;
};

export default ClientSocket;