import { StateRequestMessage } from './models';
import Constants from './constants';
import ClientSocket from './client-socket';

const ClientHandler = {};
ClientHandler.activeView = null;
ClientHandler.history = null;
ClientHandler.userName = null;
ClientHandler.roomCode = null;


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
                exitRoom();
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
    ClientHandler.userName = value;
    sessionStorage.setItem(Constants.USER_NAME_SSKEY, value);
};

ClientHandler.setRoomCode = (value) => 
{
    ClientHandler.roomCode = value;
    ClientSocket.roomCode = value;
    sessionStorage.setItem(Constants.ROOM_CODE_SSKEY, value);
};

ClientHandler.refreshState = () =>
{
    if(!ClientHandler.activeView.isRoomView)
    {
        exitRoom();
        return;
    }
    ClientHandler.activeView.showNotifUI(Constants.notifStrings.SYNCING_STATE);
    ClientSocket.send(new StateRequestMessage(ClientHandler.roomCode, ClientHandler.userName)).then(response =>
    {
        if(!ClientHandler.activeView.isRoomView)
            return;
        ClientHandler.activeView.hideNotifUI();
        ClientHandler.activeView.updateRoomState(response);
    });
};

ClientHandler.getRandomCode =() =>
{
    return Math.floor((1 + Math.random()) * 0x1000000000).toString(16);
};


//-------------------------------------------
// PRIVATE FUNCTIONS
//-------------------------------------------

const exitRoom = () =>
{
    if(ClientHandler.activeView.isRoomView)
        ClientHandler.activeView.disablePrompt();
    sessionStorage.setItem(Constants.USER_NAME_SSKEY, null);
    sessionStorage.setItem(Constants.ROOM_CODE_SSKEY, null);
    if(ClientHandler.history.location.pathname !== Constants.HOME_PATH)
        ClientHandler.goTo(Constants.HOME_PATH);
};

const handleStateUpdate = (msg) =>
{
    const newState = msg.newState;
    const existingPlayer = newState.players[ClientHandler.userName];
    if(!existingPlayer || ClientSocket.getSocketId() !== existingPlayer.socketId)
        exitRoom();
    else
        ClientHandler.activeView.updateRoomState(msg.newState);
};

const handleThisPlayerDC = () =>
{
    if(ClientHandler.activeView.isRoomView)
        ClientHandler.activeView.showNotifUI(Constants.notifStrings.CLIENT_DISCONNECTED);
};

const handleThisPlayerRC = () =>
{
    if(ClientHandler.activeView.isRoomView)
        ClientHandler.activeView.hideNotifUI();
};

const handleError = (notifString) =>
{
    if(notifString === Constants.notifStrings.ROOM_NOT_EXIST)
        exitRoom();
};

const handleMessage = (msg) => 
{
    if(msg.type === Constants.msgTypes.STATE_UPDATE)
        handleStateUpdate(msg);
    else if(msg.type ===  Constants.msgTypes.CHAT_MESSAGE)
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