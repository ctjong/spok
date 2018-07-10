const Constants = require('./constants');

const Models = 
{
    //-----------------------------------------------------------
    // GENERAL
    //-----------------------------------------------------------

    Paper: class
    {
        constructor(id)
        {
            this.id = id;
            this.parts = [];
        }
    },

    Player: class
    {
        constructor(userName, socketId)
        {
            this.userName = userName;
            this.socketId = socketId;
            this.paperId = null;
            this.isOnline = true;
            this.score = 0;
        }
    },

    GameState: class
    {
        constructor(host, initialPhase, lang)
        {
            this.lang = lang;
            this.activePart = -1;
            this.phase = initialPhase;

            this.players = {};
            this.papers = {};
            this.players[host.userName] = host;
            this.hostSocketId = host.socketId;
        }
    },

    Part: class
    {
        constructor(paperId, text, authorUserName)
        {
            this.paperId = paperId;
            this.text = text;
            this.authorUserName = authorUserName;
        }
    },

    Room: class
    {
        constructor(roomCode, lang, firstSocket)
        {
            this.roomCode = roomCode;
            this.lang = lang;
            this.sockets = {};
            this.sockets[firstSocket.id] = firstSocket;
            this.gameState = new Models.GameState();
        }
    },

    //-----------------------------------------------------------
    // MESSAGES
    //-----------------------------------------------------------

    StateUpdateMessage: class
    {
        constructor(roomCode, source, newState)
        {
            this.type = Constants.msg.types.STATE_UPDATE;
            this.roomCode = roomCode;
            this.source = source;
            this.newState = newState;
        }
    },

    JoinRequestMessage: class
    {
        constructor(roomCode, userName)
        {
            this.type = Constants.msg.types.JOIN_REQUEST;
            this.roomCode = roomCode;
            this.userName = userName;
        }
    },

    SubmitPartMessage: class 
    {
        constructor(roomCode, paperId, part)
        {
            this.type = Constants.msg.types.SUBMIT_PART;
            this.roomCode = roomCode;
            this.paperId = paperId;
            this.part = part;
        }
    },

    ChatMessage: class
    {
        constructor(roomCode, authorUserName, text)
        {
            this.type = Constants.msg.types.CHAT_MESSAGE;
            this.roomCode = roomCode;
            this.authorUserName = authorUserName;
            this.text = text;
        }
    },

    ScoreUpdateMessage: class
    {
        constructor(roomCode, paperId, delta)
        {
            this.type = Constants.msg.types.SCORE_UPDATE;
            this.roomCode = roomCode;
            this.paperId = paperId;
            this.delta = delta;
        }
    },

    PlayerDisconnectedmessage: class
    {
        constructor(roomCode, socketId)
        {
            this.type = Constants.msg.types.OTHER_PLAYER_DC;
            this.roomCode = roomCode;
            this.socketId = socketId;
        }
    },

    //-----------------------------------------------------------
    // RESPONSES
    //-----------------------------------------------------------

    JoinApprovedResponse: class 
    {
        constructor(gameState)
        {
            this.isSuccess = true;
            this.gameState = gameState;
        }
    },

    ErrorResponse: class 
    {
        constructor(errorString)
        {
            this.isSuccess = false;
            this.errorString = errorString;
        }
    },
};

module.exports = Models;