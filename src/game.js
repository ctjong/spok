import Models from './models';
import Constants from './constants';
import ClientSocket from './client-socket';

const Game = {};
Game.activeView = null;
Game.history = null;
Game.state = null;
Game.userName = null;
Game.roomCode = null;


//-------------------------------------------
// PUBLIC FUNCTIONS - HOST
//-------------------------------------------

Game.initHostUser = (roomCode, userName, lang) => 
{
    Game.setRoomCode(roomCode);
    Game.setUserName(userName);
    if(!Game.state)
    {
        const socketId = ClientSocket.getSocketId();
        const hostPlayer = new Models.Player(Game.userName, socketId);
        Game.state = new Models.GameState(hostPlayer, Constants.phases.LOBBY, lang);
        Game.state.players[Game.userName] = hostPlayer;
        saveGameState();
    }
};

Game.startRound = () => 
{
    Game.state.phase = Constants.phases.WRITE;
    Game.state.activePart = 0;
    Game.state.papers = {};
    Object.keys(Game.state.players).forEach(userName => 
    {
        const paper = new Models.Paper(Game.getRandomCode());
        const player = Game.state.players[userName];
        player.paperId = paper.id;
        Game.state.papers[paper.id] = paper;
    });
    broadcastStateAndUpdateUI();
};

Game.goToLobby = () => 
{
    Game.state.phase = Constants.phases.LOBBY;
    broadcastStateAndUpdateUI();
};

Game.kickPlayer = (player) =>
{
    delete Game.state.players[player.userName];
    if(Game.state.phase === Constants.phases.WRITE)
        updateWritePhaseState();
    broadcastSystemChat(`${player.userName} has been kicked`);
    broadcastStateAndUpdateUI();
};

Game.setAsHost = (player) =>
{
    Game.state.hostSocketId = player.socketId;
    broadcastSystemChat(`${player.userName} has been set as host`);
    broadcastStateAndUpdateUI();
};

Game.handlePartSubmitted = (part) =>
{
    const paper = Game.state.papers[part.paperId];
    if(!paper)
        return;
    paper.parts[Game.state.activePart] = part;
    updateWritePhaseState();
    broadcastStateAndUpdateUI();
};

Game.handleScoreUpdate = (paperId, delta) =>
{
    const paper = Game.state.papers[paperId];
    if(!paper)
        return;
    paper.parts.forEach(part => 
        {
            if(part.authorUserName === null)
                return;
            const player = Game.state.players[part.authorUserName];
            player.score += delta;
        });
    broadcastStateAndUpdateUI();
};

Game.handleJoinRequest = (msg) => 
{
    // join request should only be handled by host
    if(!Game.isHostUser())
        return;

    // if round is currently ongoing and the request is not for reconnection, reject it.
    const existingPlayer = Game.state.players[msg.data.userName];
    if (!existingPlayer && Game.state.phase > Constants.phases.LOBBY)
    {
        ClientSocket.sendToId(Constants.msg.types.JOIN_RESPONSE, msg.source, 
            new Models.ErrorResponse(Constants.errorStrings.ROUND_ONGOING));
        return;
    }

    // if the requested username is the same as the host user name, reject it.
    if (existingPlayer && existingPlayer.userName === Game.userName)
    {
        ClientSocket.sendToId(Constants.msg.types.JOIN_RESPONSE, msg.source, 
            new Models.ErrorResponse(Constants.errorStrings.NAME_TAKEN_BY_HOST));
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
        broadcastSystemChat(`${existingPlayer.userName} has reconnected`);
    }
    else
    {
        Game.state.players[newPlayer.userName] = newPlayer;
        broadcastSystemChat(`${newPlayer.userName} has joined`);
    }

    broadcastStateAndUpdateUI();
    ClientSocket.sendToId(Constants.msg.types.JOIN_RESPONSE, msg.source, 
        new Models.JoinApprovedResponse(Game.roomCode, Game.state));
};


//-------------------------------------------
// PUBLIC FUNCTIONS - ALL
//-------------------------------------------

Game.initNonHostUser = (roomCode, userName, gameState) =>
{
    Game.setRoomCode(roomCode);
    Game.setUserName(userName);
    Game.state = gameState;
    saveGameState();
    Game.goTo(`/room/${roomCode}`);
};

Game.goToHome = (bypassPrompt) =>
{
    if(Game.activeView.isRoomView && bypassPrompt)
        Game.activeView.isPromptDisabled = true;
    Game.goTo(Constants.HOME_PATH);
};

Game.goTo = (path) => 
{
    Game.history.push(path);
};

Game.initHistory = (history) => 
{
    Game.history = history;
    Game.history.listen(location => 
        { 
            if(location.pathname.indexOf("/room") !== 0 && Game.state)
                exitRoom();
        });
};

Game.getRandomCode = () =>
{
    if (Game.randomCodeLength > 10) Game.randomCodeLength = 10;
    return Math.floor((1 + Math.random()) * 0x1000000000).toString(16).substring(10 - Game.randomCodeLength);
};

Game.isHostUser = () => 
{
    return Game.state && ClientSocket.getSocketId() === Game.state.hostSocketId;
};

Game.setUserName = (value) => 
{
    Game.userName = value;
    sessionStorage.setItem(Constants.USER_NAME_SSKEY, value);
};

Game.setRoomCode = (value) => 
{
    Game.roomCode = value;
    ClientSocket.roomCode = value;
    sessionStorage.setItem(Constants.ROOM_CODE_SSKEY, value);
};

Game.refreshState = () =>
{
    loadGameState();
    if(!Game.activeView.isRoomView || !Game.state)
    {
        exitRoom();
        return;
    }
    ClientSocket.sendToId(Constants.msg.types.STATE_REQUEST, Game.state.hostSocketId);
    ClientSocket.addOneTimeHandler(
        Constants.msg.types.STATE_UPDATE,
        () => Game.activeView.hideErrorUI(),
        Constants.STATE_REFRESH_TIMEOUT,
        Game.refreshState
    );
};

Game.stateUpdate = (msg) =>
{
    Game.state = msg.newState;
    saveGameState();
    const currentPlayer = Game.state.players[Game.userName];
    if(!currentPlayer || ClientSocket.getSocketId() !== currentPlayer.socketId)
        exitRoom();
    else
        Game.activeView.updateUI();
};


//-------------------------------------------
// PRIVATE FUNCTIONS - HOST
//-------------------------------------------

const broadcastStateAndUpdateUI = () =>
{
    ClientSocket.sendToCurrentRoom(Constants.msg.types.STATE_UPDATE, Game.state);
    Game.activeView.updateUI();
};


//-------------------------------------------
// PRIVATE FUNCTIONS - ALL
//-------------------------------------------

const saveGameState = () =>
{
    sessionStorage.setItem(Constants.GAME_STATE_SSKEY, JSON.stringify(Game.state));
}

const loadGameState = () =>
{
    try
    {
        Game.state = JSON.parse(sessionStorage.getItem(Constants.GAME_STATE_SSKEY));
    }
    catch(e)
    {
        Game.state = null;
    }
}

const exitRoom = () =>
{
    if(Game.activeView.isRoomView)
        Game.activeView.disablePrompt();
    sessionStorage.setItem(Constants.USER_NAME_SSKEY, null);
    sessionStorage.setItem(Constants.ROOM_CODE_SSKEY, null);
    Game.state = null;
    if(Game.history.location.pathname !== Constants.HOME_PATH)
        Game.goTo(Constants.HOME_PATH);
};

const handleOtherPlayerDC = (dcSocketId) =>
{
    if(Game.state.hostSocketId === dcSocketId)
    {
        if(Game.activeView.isRoomView)
            Game.activeView.showErrorUI(Constants.errorStrings.HOST_DISCONNECTED);
    }
    else if(Game.isHostUser())
    {
        const dcPlayer = getPlayerBySocketId(dcSocketId);
        if(dcPlayer)
        {
            dcPlayer.isOnline = false;
            broadcastSystemChat(`${dcPlayer.userName} has disconnected`);
            broadcastStateAndUpdateUI();
        }
    }
};

const handleOtherPlayerRC = (rcSocketId) =>
{
    if(Game.state.hostSocketId === rcSocketId)
    {
        if(Game.activeView.isRoomView)
            Game.activeView.hideErrorUI();
    }
    else if(Game.isHostUser())
    {
        const rcPlayer = getPlayerBySocketId(rcSocketId);
        if(rcPlayer)
        {
            rcPlayer.isOnline = true;
            broadcastSystemChat(`${rcPlayer.userName} has reconnected`);
            broadcastStateAndUpdateUI();
        }
    }
};

const handleThisPlayerDC = () =>
{
    if(Game.activeView.isRoomView)
        Game.activeView.showErrorUI(Constants.errorStrings.CLIENT_DISCONNECTED);
};

const handleThisPlayerRC = () =>
{
    if(!Game.isHostUser())
        Game.refreshState();
    else if(Game.activeView.isRoomView)
        Game.activeView.hideErrorUI();
};

const handleMessage = (msg) => 
{
    switch(msg.type)
    {
        // MESSAGES FOR HOST
        case Constants.msg.types.SCORE_UPDATE:
            Game.handleScoreUpdate(msg.data.paperId, msg.data.delta);
            break;
        case Constants.msg.types.STATE_REQUEST:
            ClientSocket.sendToId(Constants.msg.types.STATE_UPDATE, msg.source, Game.state);
            break;

        // MESSAGES FOR ALL
        case Constants.msg.types.STATE_UPDATE:
            Game.handleStateUpdate(msg);
            break;
        case Constants.msg.types.CHAT_MESSAGE:
            Game.activeView.chatBox.pushMessage(msg.data);
            break;
        case Constants.msg.types.ROOM_NOT_EXIST:
            exitRoom();
            break;
        default:
            break;
    }
};

const initialize = () =>
{
    Game.userName = sessionStorage.getItem(Constants.USER_NAME_SSKEY);
    Game.roomCode = sessionStorage.getItem(Constants.ROOM_CODE_SSKEY);
    ClientSocket.addDisconnectHandler(handleThisPlayerDC);
    ClientSocket.addReconnectHandler(handleThisPlayerRC);
    ClientSocket.addMessageHandler(handleMessage);
};

initialize();
export default Game;