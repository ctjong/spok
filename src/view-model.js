import { Paper, Player, GameState, JoinApprovedResponse, JoinRejectedResponse, StartRoundMessage, ChatMessage, PlayerDisconnectedMessage } from './models';
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

ViewModel.goTo = (path) => 
{
    ViewModel.history.push(path);
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

ViewModel.initHostUser = () => 
{
    const socketId = ClientSocket.getSocketId();
    const hostPlayer = new Player(ViewModel.userName, socketId);
    ViewModel.gameState = new GameState(hostPlayer, Constants.phases.LOBBY);
    ViewModel.gameState.players[ViewModel.userName] = hostPlayer;
    startPinger();
};

ViewModel.startRound = (lang) => 
{
    ClientSocket.sendToCurrentRoom(Constants.msg.types.START_ROUND, new StartRoundMessage(lang));
    handleStartRound(lang);
};

ViewModel.submitPart = (part) => 
{
    ClientSocket.sendToCurrentRoom(Constants.msg.types.SUBMIT_PART, part);
    handlePartSubmitted(part);
};


//-------------------------------------------
// PRIVATE FUNCTIONS
//-------------------------------------------

const handleMessage = (msg, reply) => 
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
            handleStartRound(msg.data.lang);
            break;
        case Constants.msg.types.SUBMIT_PART:
            handlePartSubmitted(msg.data);
            break;
        case Constants.msg.types.PLAYER_DISCONNECTED:
            handleDisconnect(msg.data.userName);
            break;
        case Constants.msg.types.GOTO_LOBBY:
            ViewModel.gameState.phase = Constants.phases.LOBBY;
            ViewModel.activeView.updateUI();
            break;
        case Constants.msg.types.CHAT_MESSAGE:
            ViewModel.activeView.chatBox.pushMessage(msg.data);
            break;
        case Constants.msg.types.PING:
            reply(Constants.ACK);
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

    // check if the chosen name already taken by someone else in the room
    if (ViewModel.gameState.players[msg.data.userName])
    {
        ClientSocket.sendToId(Constants.msg.types.JOIN_RESPONSE, msg.source, 
            new JoinRejectedResponse(Constants.msg.errors.USER_NAME_EXISTS));
        return;
    }

    const player = new Player(msg.data.userName, msg.source);
    ClientSocket.sendToCurrentRoom(Constants.msg.types.PLAYER_JOINED, player);
    ClientSocket.sendToId(Constants.msg.types.JOIN_RESPONSE, msg.source, 
        new JoinApprovedResponse(ViewModel.roomCode, ViewModel.gameState));
    handlePlayerJoined(player);
};

const handlePlayerJoined = (player) =>
{
    // if a round is ongoing, put the player as spectator
    if(ViewModel.gameState.phase > Constants.phases.LOBBY)
        player.isSpectating = true;
    ViewModel.gameState.players[player.userName] = player;
    ViewModel.activeView.chatBox.pushMessage(new ChatMessage(null, `${player.userName} has joined`));
    ViewModel.activeView.updateUI();
};

const handleStartRound = (lang) =>
{
    ViewModel.gameState.lang = lang;
    ViewModel.gameState.phase = Constants.phases.WRITE;
    ViewModel.gameState.activePart = 1;
    Object.keys(ViewModel.gameState.players).forEach(userName => 
    {
        const player = ViewModel.gameState.players[userName];
        player.isSpectating = false;
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

const handleDisconnect = (playerUserName) =>
{
    const newPlayers = {};
    Object.keys(ViewModel.gameState.players).forEach(userName =>
        {
            if(playerUserName !== userName)
                newPlayers[userName] = ViewModel.gameState.players[userName];
        });
    ViewModel.gameState.players = newPlayers;
    if(ViewModel.gameState.phase === Constants.phases.WRITE)
        updateWritePhaseState();
    ViewModel.activeView.chatBox.pushMessage(new ChatMessage(null, `${playerUserName} has disconnected`));
    ViewModel.activeView.updateUI();
};

const updateWritePhaseState = () =>
{
    let readyToProceed = true;
    Object.keys(ViewModel.gameState.players).forEach(userName => 
        {
            const player = ViewModel.gameState.players[userName];
            if(player.isSpectating)
                return;
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

const startPinger = () =>
{
    setInterval(() => 
    {
        Object.keys(ViewModel.gameState.players).forEach(userName =>
        {
            if(userName === ViewModel.userName)
                return;
            const player = ViewModel.gameState.players[userName];
            const timeout = setTimeout(() => 
            {
                ClientSocket.sendToCurrentRoom(Constants.msg.types.PLAYER_DISCONNECTED, new PlayerDisconnectedMessage(player.userName));
                handleDisconnect(player.userName);
            }, Constants.PING_TIMEOUT);
            ClientSocket.sendToId(Constants.msg.types.PING, player.socketId).then(() => clearTimeout(timeout));
        });
    }, Constants.PING_INTERVAL);
};

const movePapers = () =>
{
    const userNames = [];
    Object.keys(ViewModel.gameState.players).forEach(userName => 
        {
            if(!ViewModel.gameState.players[userName].isSpectating)
                userNames.push(userName);
        });
    userNames.sort();

    const players = ViewModel.gameState.players;
    const firstPaper = ViewModel.gameState.players[userNames[0]].paper;
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