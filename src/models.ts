const Constants = require('./constants');

const Models:{[key:string]:any} = {};

    Models.Paper = class
    {
        id:string
        parts:string[]

        constructor(id:string)
        {
            this.id = id;
            this.parts = [];
        }
    };

    Models.Player = class
    {
        userName:string
        socketId:string
        paperId:string
        isOnline:boolean
        score:number

        constructor(userName, socketId)
        {
            this.userName = userName;
            this.socketId = socketId;
            this.paperId = null;
            this.isOnline = true;
            this.score = 0;
        }
    };

    Models.Part = class
    {
        paperId:string
        text:string
        authorUserName:string

        constructor(paperId, text, authorUserName)
        {
            this.paperId = paperId;
            this.text = text;
            this.authorUserName = authorUserName;
        }
    },

    Models.Room = class
    {
        roomCode:string
        lang:string
        activePart:number
        phase:number
        players:{[key:string]:Models.Players}

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

    Models.RoomUpdateMessage = class
    {
        constructor(roomCode, newRoomState)
        {
            this.type = Constants.msgTypes.STATE_UPDATE;
            this.roomCode = roomCode;
            this.newRoomState = newRoomState;
        }
    },

    Models.CreateRoomMessage = class
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

    Models.JoinRequestMessage = class
    {
        constructor(roomCode, userName)
        {
            this.type = Constants.msgTypes.JOIN_REQUEST;
            this.roomCode = roomCode;
            this.userName = userName;
        }
    },

    Models.SubmitPartMessage = class 
    {
        constructor(roomCode, part)
        {
            this.type = Constants.msgTypes.SUBMIT_PART;
            this.roomCode = roomCode;
            this.part = part;
        }
    },

    Models.ChatMessage = class
    {
        constructor(roomCode, authorUserName, text)
        {
            this.type = Constants.msgTypes.CHAT_MESSAGE;
            this.roomCode = roomCode;
            this.authorUserName = authorUserName;
            this.text = text;
        }
    },

    Models.GoToLobbyMessage = class
    {
        constructor(roomCode)
        {
            this.type = Constants.msgTypes.GO_TO_LOBBY;
            this.roomCode = roomCode;
        }
    },

    Models.KickPlayerMessage = class
    {
        constructor(roomCode, userName)
        {
            this.type = Constants.msgTypes.KICK_PLAYER;
            this.roomCode = roomCode;
            this.userName = userName;
        }
    },

    Models.SetAsHostMessage = class
    {
        constructor(roomCode, userName)
        {
            this.type = Constants.msgTypes.SET_AS_HOST;
            this.roomCode = roomCode;
            this.userName = userName;
        }
    },

    Models.StartRoundMessage = class
    {
        constructor(roomCode)
        {
            this.type = Constants.msgTypes.START_ROUND;
            this.roomCode = roomCode;
        }
    },

    Models.ScoreUpdateMessage = class
    {
        constructor(roomCode, paperId, delta)
        {
            this.type = Constants.msgTypes.SCORE_UPDATE;
            this.roomCode = roomCode;
            this.paperId = paperId;
            this.delta = delta;
        }
    },

    Models.StateRequestMessage = class
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

    Models.JoinApprovedResponse = class 
    {
        constructor(gameState)
        {
            this.isSuccess = true;
            this.gameState = gameState;
        }
    },

    Models.ErrorResponse = class 
    {
        constructor(notifCode)
        {
            this.isSuccess = false;
            this.notifCode = notifCode;
        }
    },

    Models.SuccessResponse = class 
    {
        constructor()
        {
            this.isSuccess = true;
        }
    },

    Models.StateResponse = class 
    {
        constructor(state)
        {
            this.isSuccess = true;
            this.state = state;
        }
    }

module.exports = Models;