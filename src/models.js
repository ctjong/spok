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
        constructor(roomCode, lang, hostUserName, hostSocket)
        {
            this.roomCode = roomCode;
            this.lang = lang;
            this.activePart = -1;
            this.phase = Constants.INITIAL_PHASE;

            this.players = {};
            this.papers = {};
            this.players[hostUserName] = new Models.Player(hostUserName, hostSocket.id);
            this.hostUserName = hostUserName;
        }
    },

    //-----------------------------------------------------------
    // MESSAGES
    //-----------------------------------------------------------

    StateUpdateMessage: class
    {
        constructor(roomCode, newState)
        {
            this.type = Constants.msgTypes.STATE_UPDATE;
            this.roomCode = roomCode;
            this.newState = newState;
        }
    },

    CreateRoomMessage: class
    {
        constructor(roomCode, hostUserName, lang)
        {
            this.type = Constants.msgTypes.CREATE_ROOM;
            this.roomCode = roomCode;
            this.hostUserName = hostUserName;
            this.lang = lang;
            this.players = {};
            this.papers = {};
        }
    },

    JoinRequestMessage: class
    {
        constructor(roomCode, userName)
        {
            this.type = Constants.msgTypes.JOIN_REQUEST;
            this.roomCode = roomCode;
            this.userName = userName;
        }
    },

    SubmitPartMessage: class 
    {
        constructor(roomCode, part)
        {
            this.type = Constants.msgTypes.SUBMIT_PART;
            this.roomCode = roomCode;
            this.part = part;
        }
    },

    ChatMessage: class
    {
        constructor(roomCode, authorUserName, text)
        {
            this.type = Constants.msgTypes.CHAT_MESSAGE;
            this.roomCode = roomCode;
            this.authorUserName = authorUserName;
            this.text = text;
        }
    },

    GoToLobbyMessage: class
    {
        constructor(roomCode)
        {
            this.type = Constants.msgTypes.GO_TO_LOBBY;
            this.roomCode = roomCode;
        }
    },

    KickPlayerMessage: class
    {
        constructor(roomCode, userName)
        {
            this.type = Constants.msgTypes.KICK_PLAYER;
            this.roomCode = roomCode;
            this.userName = userName;
        }
    },

    SetAsHostMessage: class
    {
        constructor(roomCode, userName)
        {
            this.type = Constants.msgTypes.SET_AS_HOST;
            this.roomCode = roomCode;
            this.userName = userName;
        }
    },

    StartRoundMessage: class
    {
        constructor(roomCode)
        {
            this.type = Constants.msgTypes.START_ROUND;
            this.roomCode = roomCode;
        }
    },

    ScoreUpdateMessage: class
    {
        constructor(roomCode, paperId, delta)
        {
            this.type = Constants.msgTypes.SCORE_UPDATE;
            this.roomCode = roomCode;
            this.paperId = paperId;
            this.delta = delta;
        }
    },

    StateRequestMessage: class
    {
        constructor(roomCode, userName)
        {
            this.type = Constants.msgTypes.STATE_REQUEST;
            this.roomCode = roomCode;
            this.userName = userName;
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
        constructor(notifCode)
        {
            this.isSuccess = false;
            this.notifCode = notifCode;
        }
    },

    SuccessResponse: class 
    {
        constructor()
        {
            this.isSuccess = true;
        }
    },

    StateResponse: class 
    {
        constructor(state)
        {
            this.isSuccess = true;
            this.state = state;
        }
    },
};

module.exports = Models;