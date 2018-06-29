export class Paper 
{
    constructor()
    {
        this.parts = [];
    }
}

export class Player
{
    constructor(userName, socketId)
    {
        this.userName = userName;
        this.socketId = socketId;
        this.isOnline = true;
        this.paper = null;
    }
}

export class GameState
{
    constructor(host, initialPhase)
    {
        this.lang = null;
        this.activePart = -1;
        this.phase = initialPhase;

        this.players = {};
        this.players[host.userName] = host;
        this.hostSocketId = host.socketId;
    }
}

export class JoinApprovedResponse
{
    constructor(room, gameState)
    {
        this.isSuccess = true;
        this.room = room;
        this.gameState = gameState;
    }
}

export class JoinRejectedResponse
{
    constructor(err)
    {
        this.isSuccess = false;
        this.err = err;
    }
}

export class Part
{
    constructor(text, authorUserName)
    {
        this.text = text;
        this.authorUserName = authorUserName;
        this.vote = 0;
    }
}
