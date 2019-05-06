(() => {
  const Constants = require("./constants");

  const Models: { [key: string]: any } = {};

  class Paper {
    id: string;
    parts: string[];

    constructor(id: string) {
      this.id = id;
      this.parts = [];
    }
  }

  class Player {
    userName: string;
    socketId: string;
    paperId: string;
    isOnline: boolean;
    score: number;

    constructor(userName: string, socketId: string) {
      this.userName = userName;
      this.socketId = socketId;
      this.paperId = null;
      this.isOnline = true;
      this.score = 0;
    }
  }

  class Part {
    paperId: string;
    text: string;
    authorUserName: string;

    constructor(paperId: string, text: string, authorUserName: string) {
      this.paperId = paperId;
      this.text = text;
      this.authorUserName = authorUserName;
    }
  }

  class Room {
    roomCode: string;
    lang: string;
    activePart: number;
    phase: number;
    players: { [key: string]: Player };
    papers: { [key: string]: Paper };
    hostUserName: string;

    constructor(
      roomCode: string,
      lang: string,
      hostUserName: string,
      hostSocket: { id: string }
    ) {
      this.roomCode = roomCode;
      this.lang = lang;
      this.activePart = -1;
      this.phase = Constants.INITIAL_PHASE;
      this.players = {};
      this.papers = {};
      this.players[hostUserName] = new Models.Player(
        hostUserName,
        hostSocket.id
      );
      this.hostUserName = hostUserName;
    }
  }

  //-----------------------------------------------------------
  // MESSAGES
  //-----------------------------------------------------------

  class RoomUpdateMessage {
    type: number;
    roomCode: string;
    newRoomState: Room;

    constructor(roomCode: string, newRoomState: Room) {
      this.type = Constants.msgTypes.STATE_UPDATE;
      this.roomCode = roomCode;
      this.newRoomState = newRoomState;
    }
  }

  class CreateRoomMessage {
    type: number;
    roomCode: string;
    hostUserName: string;
    lang: string;
    players: { [key: string]: Player };
    papers: { [key: string]: Paper };

    constructor(roomCode: string, hostUserName: string, lang: string) {
      this.type = Constants.msgTypes.CREATE_ROOM;
      this.roomCode = roomCode;
      this.hostUserName = hostUserName;
      this.lang = lang;
      this.players = {};
      this.papers = {};
    }
  }

  class JoinRequestMessage {
    type: number;
    roomCode: string;
    userName: string;

    constructor(roomCode: string, userName: string) {
      this.type = Constants.msgTypes.JOIN_REQUEST;
      this.roomCode = roomCode;
      this.userName = userName;
    }
  }

  class SubmitPartMessage {
    type: number;
    roomCode: string;
    part: string;

    constructor(roomCode: string, part: string) {
      this.type = Constants.msgTypes.SUBMIT_PART;
      this.roomCode = roomCode;
      this.part = part;
    }
  }

  class ChatMessage {
    type: number;
    roomCode: string;
    authorUserName: string;
    text: string;

    constructor(roomCode: string, authorUserName: string, text: string) {
      this.type = Constants.msgTypes.CHAT_MESSAGE;
      this.roomCode = roomCode;
      this.authorUserName = authorUserName;
      this.text = text;
    }
  }

  class GoToLobbyMessage {
    type: number;
    roomCode: string;

    constructor(roomCode: string) {
      this.type = Constants.msgTypes.GO_TO_LOBBY;
      this.roomCode = roomCode;
    }
  }

  class KickPlayerMessage {
    type: number;
    roomCode: string;
    userName: string;

    constructor(roomCode: string, userName: string) {
      this.type = Constants.msgTypes.KICK_PLAYER;
      this.roomCode = roomCode;
      this.userName = userName;
    }
  }

  class SetAsHostMessage {
    type: number;
    roomCode: string;
    userName: string;

    constructor(roomCode: string, userName: string) {
      this.type = Constants.msgTypes.SET_AS_HOST;
      this.roomCode = roomCode;
      this.userName = userName;
    }
  }

  class StartRoundMessage {
    type: number;
    roomCode: string;

    constructor(roomCode: string) {
      this.type = Constants.msgTypes.START_ROUND;
      this.roomCode = roomCode;
    }
  }

  class ScoreUpdateMessage {
    type: number;
    roomCode: string;
    paperId: string;
    delta: number;

    constructor(roomCode: string, paperId: string, delta: number) {
      this.type = Constants.msgTypes.SCORE_UPDATE;
      this.roomCode = roomCode;
      this.paperId = paperId;
      this.delta = delta;
    }
  }

  class StateRequestMessage {
    type: number;
    roomCode: string;
    userName: string;

    constructor(roomCode: string, userName: string) {
      this.type = Constants.msgTypes.STATE_REQUEST;
      this.roomCode = roomCode;
      this.userName = userName;
    }
  }

  //-----------------------------------------------------------
  // RESPONSES
  //-----------------------------------------------------------

  class JoinApprovedResponse {
    isSuccess: boolean;
    roomState: Room;

    constructor(roomState: Room) {
      this.isSuccess = true;
      this.roomState = roomState;
    }
  }

  class ErrorResponse {
    isSuccess: boolean;
    notifCode: number;

    constructor(notifCode: number) {
      this.isSuccess = false;
      this.notifCode = notifCode;
    }
  }

  class SuccessResponse {
    isSuccess: boolean;

    constructor() {
      this.isSuccess = true;
    }
  }

  class StateResponse {
    isSuccess: boolean;
    state: Room;

    constructor(state: Room) {
      this.isSuccess = true;
      this.state = state;
    }
  }

  module.exports = {
    Paper,
    Player,
    Part,
    Room,
    RoomUpdateMessage,
    CreateRoomMessage,
    JoinRequestMessage,
    SubmitPartMessage,
    ChatMessage,
    GoToLobbyMessage,
    KickPlayerMessage,
    SetAsHostMessage,
    StartRoundMessage,
    ScoreUpdateMessage,
    StateRequestMessage,
    JoinApprovedResponse,
    ErrorResponse,
    SuccessResponse,
    StateResponse
  };
})();
