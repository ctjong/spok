export class Paper 
{
    constructor(id)
    {
        this.id = id;
        this.parts = [];
    }
}

export class Player
{
    constructor(userName, socketId)
    {
        this.userName = userName;
        this.socketId = socketId;
        this.paperId = null;
        this.isOnline = true;
        this.score = 0;
    }
}

export class GameState
{
    constructor(host, initialPhase, lang)
    {
        this.lang = lang;
        this.activePart = -1;
        this.phase = initialPhase;

        this.players = {};
        this.papers = {};
        this.players[host.userName] = host;
        this.hostUserName = host.userName;
    }
}

export class PlayerMessageData
{
    constructor(userName)
    {
        this.userName = userName;
    }
}

export class JoinApprovedResponse
{
    constructor(roomCode, gameState)
    {
        this.isSuccess = true;
        this.roomCode = roomCode;
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
    }
}

export class SubmitPartMessage
{
    constructor(paperId, part)
    {
        this.paperId = paperId;
        this.part = part;
    }
}

export class ChatMessage
{
    constructor(authorUserName, text)
    {
        this.authorUserName = authorUserName;
        this.text = text;
    }
}

export class ScoreUpdate
{
    constructor(paperId, delta)
    {
        this.paperId = paperId;
        this.delta = delta;
    }
}