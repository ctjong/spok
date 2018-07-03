import { Paper, Player, GameState, JoinApprovedResponse, JoinRejectedResponse, ChatMessage } from './models';
import Constants from './constants';
import ClientSocket from './client-socket';

const ViewModel = {};
ViewModel.activeView = null;
ViewModel.history = null;
ViewModel.gameState = null;
ViewModel.userName = null;
ViewModel.roomCode = null;


//-------------------------------------------
// PUBLIC FUNCTIONS - HOST
//-------------------------------------------

ViewModel.initHostUser = (roomCode, userName, lang) => 
{
    ViewModel.setRoomCode(roomCode);
    ViewModel.setUserName(userName);
    if(!ViewModel.gameState)
    {
        const socketId = ClientSocket.getSocketId();
        const hostPlayer = new Player(ViewModel.userName, socketId);
        ViewModel.gameState = new GameState(hostPlayer, Constants.phases.LOBBY, lang);
        ViewModel.gameState.players[ViewModel.userName] = hostPlayer;
    }
};

ViewModel.startRound = () => 
{
    ViewModel.gameState.phase = Constants.phases.WRITE;
    ViewModel.gameState.activePart = 0;
    ViewModel.gameState.papers = {};
    Object.keys(ViewModel.gameState.players).forEach(userName => 
    {
        const paper = new Paper(ViewModel.getRandomCode());
        const player = ViewModel.gameState.players[userName];
        player.paperId = paper.id;
        ViewModel.gameState.papers[paper.id] = paper;
    });
    broadcastStateAndUpdateUI();
};

ViewModel.goToLobby = () => 
{
    ViewModel.gameState.phase = Constants.phases.LOBBY;
    broadcastStateAndUpdateUI();
};

ViewModel.kickPlayer = (player) =>
{
    delete ViewModel.gameState.players[player.userName];
    if(ViewModel.gameState.phase === Constants.phases.WRITE)
        updateWritePhaseState();
    broadcastSystemChat(`${player.userName} has been kicked`);
    broadcastStateAndUpdateUI();
};

ViewModel.handlePartSubmitted = (part) =>
{
    const paper = ViewModel.gameState.papers[part.paperId];
    if(!paper)
        return;
    paper.parts[ViewModel.gameState.activePart] = part;
    updateWritePhaseState();
    broadcastStateAndUpdateUI();
};

ViewModel.handleScoreUpdate = (paperId, delta) =>
{
    const paper = ViewModel.gameState.papers[paperId];
    if(!paper)
        return;
    paper.parts.forEach(part => 
        {
            if(part.authorUserName === null)
                return;
            const player = ViewModel.gameState.players[part.authorUserName];
            player.score += delta;
        });
    broadcastStateAndUpdateUI();
};


//-------------------------------------------
// PUBLIC FUNCTIONS - ALL
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
    return ViewModel.gameState && ClientSocket.getSocketId() === ViewModel.gameState.hostSocketId;
};

ViewModel.setUserName = (value) => 
{
    ViewModel.userName = value;
    sessionStorage.setItem(Constants.USER_NAME, value);
};

ViewModel.setRoomCode = (value) => 
{
    ViewModel.roomCode = value;
    ClientSocket.roomCode = value;
    sessionStorage.setItem(Constants.ROOM_CODE, value);
};


//-------------------------------------------
// PRIVATE FUNCTIONS - HOST
//-------------------------------------------

const handleJoinRequest = (msg) => 
{
    // join request should only be handled by host
    if(!ViewModel.isHostUser())
        return;

    // if round is currently ongoing and the request is not for reconnection, reject it.
    if (ViewModel.gameState.phase > Constants.phases.LOBBY && !ViewModel.gameState.players[msg.data.userName])
    {
        ClientSocket.sendToId(Constants.msg.types.JOIN_RESPONSE, msg.source, 
            new JoinRejectedResponse(Constants.msg.errors.ROUND_ONGOING));
        return;
    }

    // accept the request if:
    // - the chosen name is already present in the room (reconnect attempt), OR
    // - people are in the lobby
    const newPlayer = new Player(msg.data.userName, msg.source);
    const existingPlayer = ViewModel.gameState.players[newPlayer.userName];
    if(existingPlayer)
    {
        existingPlayer.isOnline = true;
        existingPlayer.socketId = newPlayer.socketId;
    }
    else
    {
        ViewModel.gameState.players[newPlayer.userName] = newPlayer;
        ViewModel.activeView.chatBox.pushMessage(new ChatMessage(null, `${newPlayer.userName} has joined`));
    }

    broadcastStateAndUpdateUI();
    ClientSocket.sendToId(Constants.msg.types.JOIN_RESPONSE, msg.source, 
        new JoinApprovedResponse(ViewModel.roomCode, ViewModel.gameState));
};

const updateWritePhaseState = () =>
{
    let readyToProceed = true;
    Object.keys(ViewModel.gameState.players).forEach(userName => 
        {
            const paperId = ViewModel.gameState.players[userName].paperId;
            const paper = ViewModel.gameState.papers[paperId];
            if(paper && !paper.parts[ViewModel.gameState.activePart])
                readyToProceed = false;
        });

    if(readyToProceed)
    {
        if(ViewModel.gameState.activePart >= Constants.TOTAL_PARTS - 1)
            ViewModel.gameState.phase = Constants.phases.REVEAL;
        else
        {
            movePapers();
            ViewModel.gameState.activePart++;
        }
    }
};

const movePapers = () =>
{
    const players = ViewModel.gameState.players;
    const userNames = Object.keys(players);
    userNames.sort();

    const firstPaperId = players[userNames[0]].paperId;
    userNames.forEach((userName, index) => 
    {
        players[userName].paperId = (index < userNames.length - 1) ? 
            players[userNames[index+1]].paperId : firstPaperId;
    });
};

const broadcastSystemChat = (text) =>
{
    const chatMsg = new ChatMessage(null, text);
    ClientSocket.sendToCurrentRoom(Constants.msg.types.CHAT_MESSAGE, chatMsg);
    ViewModel.activeView.chatBox.pushMessage(chatMsg);
};

const broadcastStateAndUpdateUI = () =>
{
    ClientSocket.sendToCurrentRoom(Constants.msg.types.STATE_UPDATE, ViewModel.gameState);
    ViewModel.activeView.updateUI();
};


//-------------------------------------------
// PRIVATE FUNCTIONS - ALL
//-------------------------------------------

const handleStateUpdate = (msg) =>
{
    ViewModel.gameState = msg.data;
    if(!ViewModel.gameState.players[ViewModel.userName])
    {
        ViewModel.goTo("/");
        return;
    }
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
    if(socketId === ClientSocket.getSocketId())
    {
        ClientSocket.reset();
        ViewModel.activeView.tryToRejoin();
    }
    if(ViewModel.gameState.hostSocketId === player.socketId)
        chooseNewHost();
    if(ViewModel.isHostUser())
    {
        ViewModel.initHostUser(ViewModel.roomCode, ViewModel.userName);
        broadcastStateAndUpdateUI();
    }
};

const chooseNewHost = () =>
{
    const userNames = [];
    Object.keys(ViewModel.gameState.players).forEach(userName => 
    {
        if(ViewModel.gameState.players[userName].socketId !== ViewModel.gameState.hostSocketId)
            userNames.push(userName);
    });
    userNames.sort();
    ViewModel.gameState.hostSocketId = ViewModel.gameState.players[userNames[0]].socketId;
};

const handleMessage = (msg) => 
{
    switch(msg.type)
    {
        // MESSAGES FOR HOST
        case Constants.msg.types.JOIN_REQUEST:
            handleJoinRequest(msg);
            break;
        case Constants.msg.types.PLAYER_OFFLINE:
            handleDisconnect(msg.data.socketId);
            break;
        case Constants.msg.types.SUBMIT_PART:
            ViewModel.handlePartSubmitted(msg.data);
            break;
        case Constants.msg.types.SCORE_UPDATE:
            ViewModel.handleScoreUpdate(msg.data.paperId, msg.data.delta);
            break;
        case Constants.msg.types.STATE_REQUEST:
            ClientSocket.sendToId(Constants.msg.types.STATE_UPDATE, msg.source, ViewModel.gameState);
            break;

        // MESSAGES FOR ALL
        case Constants.msg.types.STATE_UPDATE:
            handleStateUpdate(msg);
            break;
        case Constants.msg.types.CHAT_MESSAGE:
            ViewModel.activeView.chatBox.pushMessage(msg.data);
            break;
        default:
            break;
    }
};

const initialize = () =>
{
    ViewModel.userName = sessionStorage.getItem(Constants.USER_NAME);
    ViewModel.roomCode = sessionStorage.getItem(Constants.ROOM_CODE);
    ClientSocket.addMessageHandler(handleMessage);
};

initialize();
export default ViewModel;