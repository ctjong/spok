import { Paper, Player, GameState, JoinApprovedResponse, JoinRejectedResponse, ChatMessage, PlayerMessageData } from './models';
import Constants from './constants';
import ClientSocket from './client-socket';

const Game = {};
Game.activeView = null;
Game.history = null;
Game.state = null;
Game.userName = null;
Game.roomCode = null;

let pingTimer = null;


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
        const hostPlayer = new Player(Game.userName, socketId);
        Game.state = new GameState(hostPlayer, Constants.phases.LOBBY, lang);
        Game.state.players[Game.userName] = hostPlayer;
        pingTimer = setInterval(() => ClientSocket.sendToCurrentRoom(Constants.msg.types.PING), Constants.PING_INTERVAL);
    }
};

Game.startRound = () => 
{
    Game.state.phase = Constants.phases.WRITE;
    Game.state.activePart = 0;
    Game.state.papers = {};
    Object.keys(Game.state.players).forEach(userName => 
    {
        const paper = new Paper(Game.getRandomCode());
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


//-------------------------------------------
// PUBLIC FUNCTIONS - ALL
//-------------------------------------------

Game.goToHome = (bypassPrompt) =>
{
    if(Game.activeView.isRoomView && bypassPrompt)
        Game.activeView.isPromptDisabled = true;
    Game.goTo("/");
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
            if(location.pathname.indexOf("/room") !== 0)
                ClientSocket.tryClose() 
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
    sessionStorage.setItem(Constants.USER_NAME, value);
};

Game.setRoomCode = (value) => 
{
    Game.roomCode = value;
    ClientSocket.roomCode = value;
    sessionStorage.setItem(Constants.ROOM_CODE, value);
};

Game.tryToRejoin = () =>
{
    ClientSocket.reset().then(() => 
    {
        ClientSocket.sendToId(Constants.msg.types.JOIN_REQUEST, Game.roomCode, new PlayerMessageData(Game.userName));
        ClientSocket.addOneTimeHandler(
            Constants.msg.types.JOIN_RESPONSE,
            (msg) =>
            {
                if(!msg.data.isSuccess)
                    disposeCurrentUser();
                else
                {
                    Game.state = msg.data.gameState;
                    Game.activeView.updateUI();
                }
            }, 
            Constants.JOIN_TIMEOUT,
            () => disposeCurrentUser()
        );
    });
};


//-------------------------------------------
// PRIVATE FUNCTIONS - HOST
//-------------------------------------------

const handleJoinRequest = (msg) => 
{
    // join request should only be handled by host
    if(!Game.isHostUser())
        return;

    // if round is currently ongoing and the request is not for reconnection, reject it.
    if (Game.state.phase > Constants.phases.LOBBY && !Game.state.players[msg.data.userName])
    {
        ClientSocket.sendToId(Constants.msg.types.JOIN_RESPONSE, msg.source, 
            new JoinRejectedResponse(Constants.msg.errors.ROUND_ONGOING));
        return;
    }

    // accept the request if:
    // - the chosen name is already present in the room (reconnect attempt), OR
    // - people are in the lobby
    const newPlayer = new Player(msg.data.userName, msg.source);
    const existingPlayer = Game.state.players[newPlayer.userName];
    if(existingPlayer)
    {
        existingPlayer.isOnline = true;
        existingPlayer.socketId = newPlayer.socketId;
        Game.activeView.chatBox.pushMessage(new ChatMessage(null, `${existingPlayer.userName} has reconnected`));
    }
    else
    {
        Game.state.players[newPlayer.userName] = newPlayer;
        Game.activeView.chatBox.pushMessage(new ChatMessage(null, `${newPlayer.userName} has joined`));
    }

    broadcastStateAndUpdateUI();
    ClientSocket.sendToId(Constants.msg.types.JOIN_RESPONSE, msg.source, 
        new JoinApprovedResponse(Game.roomCode, Game.state));
};

const updateWritePhaseState = () =>
{
    let readyToProceed = true;
    Object.keys(Game.state.players).forEach(userName => 
        {
            const paperId = Game.state.players[userName].paperId;
            const paper = Game.state.papers[paperId];
            if(paper && !paper.parts[Game.state.activePart])
                readyToProceed = false;
        });

    if(readyToProceed)
    {
        if(Game.state.activePart >= Constants.TOTAL_PARTS - 1)
            Game.state.phase = Constants.phases.REVEAL;
        else
        {
            movePapers();
            Game.state.activePart++;
        }
    }
};

const movePapers = () =>
{
    const players = Game.state.players;
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
    Game.activeView.chatBox.pushMessage(chatMsg);
};

const broadcastStateAndUpdateUI = () =>
{
    ClientSocket.sendToCurrentRoom(Constants.msg.types.STATE_UPDATE, Game.state);
    Game.activeView.updateUI();
};


//-------------------------------------------
// PRIVATE FUNCTIONS - ALL
//-------------------------------------------

const handleStateUpdate = (msg) =>
{
    Game.state = msg.data;
    const currentPlayer = Game.state.players[Game.userName];
    if(!currentPlayer)
        disposeCurrentUser();
    else if(!currentPlayer.isOnline)
        Game.tryToRejoin();
    else
        Game.activeView.updateUI();
};

const handleDisconnect = (socketId) =>
{
    let player = null;
    Object.keys(Game.state.players).some(userName =>
    {
        if(Game.state.players[userName].socketId === socketId)
        {
            player = Game.state.players[userName];
            return true;
        }
        return false;
    });
    if(!player)
        return;
    player.isOnline = false;
    if(Game.state.hostSocketId === player.socketId)
        chooseNewHost();
    if(Game.isHostUser())
    {
        Game.initHostUser(Game.roomCode, Game.userName);
        broadcastStateAndUpdateUI();
        Game.activeView.chatBox.pushMessage(new ChatMessage(null, `${player.userName} has disconnected`));
    }
    if(socketId === ClientSocket.getSocketId())
        Game.tryToRejoin();
};

const chooseNewHost = () =>
{
    const userNames = [];
    Object.keys(Game.state.players).forEach(userName => 
    {
        if(Game.state.players[userName].socketId !== Game.state.hostSocketId)
            userNames.push(userName);
    });
    userNames.sort();
    Game.state.hostSocketId = Game.state.players[userNames[0]].socketId;
};

const disposeCurrentUser = () =>
{
    clearTimeout(pingTimer);
    if(Game.activeView.isRoomView)
        Game.activeView.isPromptDisabled = true;
    Game.goTo("/");
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
            Game.handlePartSubmitted(msg.data);
            break;
        case Constants.msg.types.SCORE_UPDATE:
            Game.handleScoreUpdate(msg.data.paperId, msg.data.delta);
            break;
        case Constants.msg.types.STATE_REQUEST:
            ClientSocket.sendToId(Constants.msg.types.STATE_UPDATE, msg.source, Game.state);
            break;

        // MESSAGES FOR ALL
        case Constants.msg.types.STATE_UPDATE:
            handleStateUpdate(msg);
            break;
        case Constants.msg.types.CHAT_MESSAGE:
            Game.activeView.chatBox.pushMessage(msg.data);
            break;
        case Constants.msg.types.PING:
            ClientSocket.sendToId(Constants.msg.types.ACK, Game.state.hostSocketId);
            break;
        default:
            break;
    }
};

const initialize = () =>
{
    Game.userName = sessionStorage.getItem(Constants.USER_NAME);
    Game.roomCode = sessionStorage.getItem(Constants.ROOM_CODE);
    ClientSocket.addMessageHandler(handleMessage);
};

initialize();
export default Game;