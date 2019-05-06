import { StateRequestMessage } from '../models';
import Constants from '../constants';
import ClientSocket from './client-socket';

const ClientHandler = {};
ClientHandler.activeView = null;
ClientHandler.history = null;
ClientHandler.userName = null;
ClientHandler.roomCode = null;
ClientHandler.lastNotifCode = null;


//-------------------------------------------
// PUBLIC FUNCTIONS
//-------------------------------------------

ClientHandler.goTo = (path) => 
{
    ClientHandler.history.push(path);
};

ClientHandler.initHistory = (history) => 
{
    ClientHandler.history = history;
    ClientHandler.history.listen(location => 
        { 
            if(location.pathname.indexOf("/room") !== 0 && ClientHandler.getRoomState())
                exitRoom(Constants.notifCodes.UNKNOWN_ERROR);
            if(location.pathname !== Constants.HOME_PATH)
                ClientHandler.lastNotifCode = null;
        });
};

ClientHandler.getRoomState = () =>
{
    if(!ClientHandler.activeView.isRoomView || !ClientHandler.activeView.state)
        return null;
    return ClientHandler.activeView.state.room;
};

ClientHandler.isHostUser = () => 
{
    const roomState = ClientHandler.getRoomState();
    return roomState && ClientHandler.userName === roomState.hostUserName;
};

ClientHandler.setUserName = (value) => 
{
    console.log(`setting current userName to ${value}`);
    ClientHandler.userName = value;
    sessionStorage.setItem(Constants.USER_NAME_SSKEY, value);
};

ClientHandler.setRoomCode = (value) => 
{
    console.log(`setting current roomCode to ${value}`);
    ClientHandler.roomCode = value;
    sessionStorage.setItem(Constants.ROOM_CODE_SSKEY, value);
};

ClientHandler.refreshState = () =>
{
    if(!ClientHandler.activeView.isRoomView)
    {
        exitRoom(Constants.notifCodes.UNKNOWN_ERROR);
        return;
    }
    ClientHandler.activeView.showNotifUI(Constants.notifCodes.SYNCING_STATE);
    ClientSocket.send(new StateRequestMessage(ClientHandler.roomCode, ClientHandler.userName)).then(response =>
    {
        if(!ClientHandler.activeView.isRoomView)
            return;
        ClientHandler.activeView.hideNotifUI();
        ClientHandler.activeView.updateRoomState(response.state);
    });
};

ClientHandler.getRandomCode =() =>
{
    return Math.floor((1 + Math.random()) * 0x1000000000).toString(16);
};


//-------------------------------------------
// PRIVATE FUNCTIONS
//-------------------------------------------

const exitRoom = (reasonCode) =>
{
    console.log("Exiting room because of error code " + reasonCode);
    ClientHandler.lastNotifCode = reasonCode;
    if(ClientHandler.activeView.isRoomView)
        ClientHandler.activeView.disablePrompt();
    sessionStorage.setItem(Constants.USER_NAME_SSKEY, null);
    sessionStorage.setItem(Constants.ROOM_CODE_SSKEY, null);
    ClientSocket.close();
    if(ClientHandler.history.location.pathname !== Constants.HOME_PATH)
        ClientHandler.goTo(Constants.HOME_PATH);
};

const handleStateUpdate = (msg) =>
{
    const newRoomState = msg.newRoomState;
    const existingPlayer = newRoomState.players[ClientHandler.userName];
    if(!existingPlayer || ClientSocket.getSocketId() !== existingPlayer.socketId)
        exitRoom(Constants.notifCodes.JOIN_ANOTHER_DEVICE);
    else if(ClientHandler.activeView.isRoomView)
        ClientHandler.activeView.updateRoomState(msg.newRoomState);
};

const handleThisPlayerDC = () =>
{
    if(ClientHandler.activeView.isRoomView)
        ClientHandler.activeView.showNotifUI(Constants.notifCodes.CLIENT_DISCONNECTED);
};

const handleThisPlayerRC = () =>
{
    ClientHandler.refreshState();
    if(ClientHandler.activeView.isRoomView)
        ClientHandler.activeView.hideNotifUI();
};

const handleError = (notifCode) =>
{
    if(Constants.fatalErrors.indexOf(notifCode) >= 0)
        exitRoom(notifCode);
};

const handleMessage = (msg) => 
{
    if(msg.type === Constants.msgTypes.STATE_UPDATE)
        handleStateUpdate(msg);
    else if(msg.type ===  Constants.msgTypes.CHAT_MESSAGE && ClientHandler.activeView.isRoomView)
        ClientHandler.activeView.chatBox.pushMessage(msg);
};

const initialize = () =>
{
    ClientHandler.userName = sessionStorage.getItem(Constants.USER_NAME_SSKEY);
    ClientHandler.roomCode = sessionStorage.getItem(Constants.ROOM_CODE_SSKEY);
    ClientSocket.addDisconnectHandler(handleThisPlayerDC);
    ClientSocket.addReconnectHandler(handleThisPlayerRC);
    ClientSocket.addErrorHandler(handleError);
    ClientSocket.addMessageHandler(handleMessage);
};

initialize();
export default ClientHandler;