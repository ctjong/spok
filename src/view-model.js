import { Paper, Player, GameState, JoinApprovedResponse, JoinRejectedResponse, ChatMessage, PlayerMessageData } from './models';
import Constants from './constants';
import ClientSocket from './client-socket';

const ViewModel = {};
ViewModel.activeView = null;
ViewModel.history = null;
ViewModel.gameState = null;
ViewModel.userName = null;
ViewModel.roomCode = null;

//-------------------------------------------
// PUBLIC FUNCTIONS
//-------------------------------------------

ViewModel.goTo = (path) => 
{
    ViewModel.history.push(path);
};

ViewModel.initHistory = (history) => 
{
    ViewModel.history = history;
    ViewModel.history.listen(location => 
        { 
            if(location.pathname.indexOf("/room") !== 0)
                ClientSocket.tryClose() 
        });
};

ViewModel.getRandomCode = () =>
{
    if (ViewModel.randomCodeLength > 10) ViewModel.randomCodeLength = 10;
    return Math.floor((1 + Math.random()) * 0x1000000000).toString(16).substring(10 - ViewModel.randomCodeLength);
};

ViewModel.isHostUser = () => 
{
    return ViewModel.gameState && ViewModel.userName === ViewModel.gameState.hostUserName;
};

ViewModel.initHostUser = (roomCode, userName, lang) => 
{
    setRoomCode(roomCode);
    setUserName(userName);
    if(!ViewModel.gameState)
    {
        const socketId = ClientSocket.getSocketId();
        const hostPlayer = new Player(ViewModel.userName, socketId);
        ViewModel.gameState = new GameState(hostPlayer, Constants.phases.LOBBY, lang);
        ViewModel.gameState.players[ViewModel.userName] = hostPlayer;
    }
};

ViewModel.initNonHostUser = (roomCode, userName, gameState) =>
{
    setRoomCode(roomCode);
    setUserName(userName);
    ViewModel.gameState = gameState;
};

ViewModel.startRound = () => 
{
    ClientSocket.sendToCurrentRoom(Constants.msg.types.START_ROUND);
    handleStartRound();
};

ViewModel.submitPart = (part) => 
{
    ClientSocket.sendToCurrentRoom(Constants.msg.types.SUBMIT_PART, part);
    handlePartSubmitted(part);
};

ViewModel.kickPlayer = (player) =>
{
    ClientSocket.sendToCurrentRoom(Constants.msg.types.KICK_PLAYER, new PlayerMessageData(player.userName));
    handlePlayerKicked(player.userName);
};


//-------------------------------------------
// PRIVATE FUNCTIONS
//-------------------------------------------

const setUserName = (value) => 
{
    ViewModel.userName = value;
    sessionStorage.setItem(Constants.USER_NAME, value);
};

const setRoomCode = (value) => 
{
    ViewModel.roomCode = value;
    ClientSocket.roomCode = value;
    sessionStorage.setItem(Constants.ROOM_CODE, value);
};

const handleMessage = (msg) => 
{
    switch(msg.type)
    {
        case Constants.msg.types.JOIN_REQUEST:
            handleJoinRequest(msg);
            break;
        case Constants.msg.types.PLAYER_JOINED:
            handlePlayerJoined(msg.data);
            break;
        case Constants.msg.types.START_ROUND:
            handleStartRound();
            break;
        case Constants.msg.types.SUBMIT_PART:
            handlePartSubmitted(msg.data);
            break;
        case Constants.msg.types.PLAYER_OFFLINE:
            handleDisconnect(msg.data.socketId);
            break;
        case Constants.msg.types.KICK_PLAYER:
            handlePlayerKicked(msg.data.userName);
            break;
        case Constants.msg.types.HOST_CHANGE:
            ViewModel.gameState.hostUserName = msg.data.userName;
            break;
        case Constants.msg.types.GOTO_LOBBY:
            ViewModel.gameState.phase = Constants.phases.LOBBY;
            ViewModel.activeView.updateUI();
            break;
        case Constants.msg.types.CHAT_MESSAGE:
            ViewModel.activeView.chatBox.pushMessage(msg.data);
            break;
        default:
            break;
    }
};

const handleJoinRequest = (msg) => 
{
    // join request should only be handled by host
    if(!ViewModel.activeView.isRoomView || !ViewModel.isHostUser())
        return;

    // if the chosen name already taken by someone else in the room, reject it.
    let player = ViewModel.gameState.players[msg.data.userName]
    if (player && player.isOnline)
    {
        ClientSocket.sendToId(Constants.msg.types.JOIN_RESPONSE, msg.source, 
            new JoinRejectedResponse(Constants.msg.errors.USER_NAME_EXISTS));
        return;
    }

    // if round is currently ongoing and the request is not for reconnection, reject it.
    if (ViewModel.gameState.phase > Constants.phases.LOBBY && !player)
    {
        ClientSocket.sendToId(Constants.msg.types.JOIN_RESPONSE, msg.source, 
            new JoinRejectedResponse(Constants.msg.errors.ROUND_ONGOING));
        return;
    }

    // if round hasn't started and no one else has taken the username, OR
    // if round has started and player with the username is offline, accept it.
    player = new Player(msg.data.userName, msg.source);
    ClientSocket.sendToCurrentRoom(Constants.msg.types.PLAYER_JOINED, player);
    ClientSocket.sendToId(Constants.msg.types.JOIN_RESPONSE, msg.source, 
        new JoinApprovedResponse(ViewModel.roomCode, ViewModel.gameState));
    handlePlayerJoined(player);
};

const handlePlayerJoined = (newPlayer) =>
{
    const existingPlayer = ViewModel.gameState.players[newPlayer.userName];
    if(existingPlayer)
    {
        existingPlayer.isOnline = true;
        existingPlayer.socketId = newPlayer.socketId;
        ViewModel.activeView.chatBox.pushMessage(new ChatMessage(null, `${existingPlayer.userName} has reconnected`));
    }
    else
    {
        ViewModel.gameState.players[newPlayer.userName] = newPlayer;
        ViewModel.activeView.chatBox.pushMessage(new ChatMessage(null, `${newPlayer.userName} has joined`));
    }
    ViewModel.activeView.updateUI();
};

const handleStartRound = () =>
{
    ViewModel.gameState.phase = Constants.phases.WRITE;
    ViewModel.gameState.activePart = 1;
    Object.keys(ViewModel.gameState.players).forEach(userName => 
    {
        const player = ViewModel.gameState.players[userName];
        player.paper = new Paper();
    });
    ViewModel.activeView.updateUI();
};

const handlePartSubmitted = (part) =>
{
    const author = ViewModel.gameState.players[part.authorUserName];
    if(!author)
    {
        console.log("[ViewModel.submitPart] player not found with username " + part.authorUserName);
        return;
    }
    author.paper.parts.push(part);
    updateWritePhaseState();
    ViewModel.activeView.updateUI();
};

const handleDisconnect = (socketId) =>
{
    let player = null;
    Object.keys(ViewModel.gameState.players).some(userName =>
    {
        if(ViewModel.gameState.players[userName].socketId === socketId)
        {
            player = ViewModel.gameState.players[userName];
            return true;
        }
        return false;
    });
    if(!player)
        return;
    player.isOnline = false;
    ViewModel.activeView.chatBox.pushMessage(new ChatMessage(null, `${player.userName} has disconnected`));
    ViewModel.activeView.updateUI();
    if(ViewModel.gameState.hostUserName === player.userName)
        chooseNewHost();
};

const handlePlayerKicked = (playerUserName) =>
{
    if(playerUserName === ViewModel.userName)
    {
        ViewModel.gameState = null;
        ViewModel.goTo("/");
    }
    else
    {
        delete ViewModel.gameState.players[playerUserName];
        if(ViewModel.gameState.phase === Constants.phases.WRITE)
            updateWritePhaseState();
        ViewModel.activeView.chatBox.pushMessage(new ChatMessage(null, `${playerUserName} has been kicked`));
        ViewModel.activeView.updateUI();
    }
};

const updateWritePhaseState = () =>
{
    let readyToProceed = true;
    Object.keys(ViewModel.gameState.players).forEach(userName => 
        {
            const player = ViewModel.gameState.players[userName];
            const paper = player.paper;
            if(paper && paper.parts.length < ViewModel.gameState.activePart)
                readyToProceed = false;
        });

    if(readyToProceed)
    {
        if(ViewModel.gameState.activePart >= Constants.TOTAL_PARTS)
            ViewModel.gameState.phase = Constants.phases.REVEAL;
        else
        {
            movePapers();
            ViewModel.gameState.activePart++;
        }
    }
};

const chooseNewHost = () =>
{
    const userNames = [];
    Object.keys(ViewModel.gameState.players).forEach(userName => 
    {
        if(userName !== ViewModel.gameState.hostUserName)
            userNames.push(userName);
    });
    userNames.sort();
    ViewModel.gameState.hostUserName = userNames[0];
    if(ViewModel.gameState.hostUserName === ViewModel.userName)
    {
        ViewModel.initHostUser(ViewModel.roomCode, ViewModel.userName);
        ClientSocket.sendToCurrentRoom(Constants.msg.types.HOST_CHANGE, new PlayerMessageData(ViewModel.userName));
        ViewModel.activeView.updateUI();
    }
};

const movePapers = () =>
{
    const players = ViewModel.gameState.players;
    const userNames = Object.keys(players);
    userNames.sort();

    const firstPaper = players[userNames[0]].paper;
    userNames.forEach((userName, index) => 
    {
        players[userName].paper = (index < userNames.length - 1) ? 
            players[userNames[index+1]].paper : firstPaper;
    });
};

const initialize = () =>
{
    ViewModel.userName = sessionStorage.getItem(Constants.USER_NAME);
    ViewModel.roomCode = sessionStorage.getItem(Constants.ROOM_CODE);
    ClientSocket.addMessageHandler(handleMessage);
};

initialize();
export default ViewModel;